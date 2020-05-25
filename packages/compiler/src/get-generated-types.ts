import fs from "fs-extra";
import nodePath from "path";
import {
  DocumentNode,
  OperationDefinitionNode,
  FragmentDefinitionNode,
  visit,
  validate,
  specifiedRules,
  NoUnusedFragmentsRule,
  GraphQLError,
  parse,
  NameNode,
  ValidationContext,
  ASTVisitor,
} from "graphql";
import slash from "slash";
import globby from "globby";
import { cachedGenerateSchemaTypes } from "./schema-types";
import {
  cachedGenerateOperationTypes,
  cachedGenerateErrorModuleFsOperation,
} from "./operation-types";
import { FsOperation } from "./fs-operations";
import { Config } from "@ts-gql/config";
import { extractGraphQLDocumentsContentsFromFile } from "./extract-documents";
import { CompilerError, FullSourceLocation } from "./types";
import { codeFrameColumns } from "@babel/code-frame";

function memoize<V>(fn: (arg: string) => V): (arg: string) => V {
  const cache: { [key: string]: V } = {};

  return (arg: string) => {
    if (cache[arg] === undefined) cache[arg] = fn(arg);
    return cache[arg];
  };
}

function getPrintCompilerError() {
  let readFile = memoize((filename: string) => fs.readFile(filename, "utf8"));
  return async (error: CompilerError) => {
    let content = await readFile(error.filename);
    return (
      error.filename +
      "\n" +
      (error.loc
        ? codeFrameColumns(content, error.loc, {
            message: error.message,
            highlightCode: true,
          })
        : error.message)
    );
  };
}

let fragmentDocumentRules = specifiedRules
  .filter((x) => x !== NoUnusedFragmentsRule)
  .concat(function FragmentNameValidationRule(
    context: ValidationContext
  ): ASTVisitor {
    return {
      FragmentDefinition(node) {
        let message =
          "Fragment names must be in the format ComponentName_propName";

        if (!node.name) {
          context.reportError(new GraphQLError(message, [node]));
        } else if (!/.+_.+/.test(node.name.value)) {
          context.reportError(new GraphQLError(message, [node.name]));
        }
      },
    };
  });

type NamedOperationDefinitionNode = Omit<OperationDefinitionNode, "name"> & {
  readonly name: NameNode;
};

type NamedFragmentDefinitionNode = Omit<FragmentDefinitionNode, "name"> & {
  readonly name: NameNode;
};

type Document = {
  filename: string;
  loc: FullSourceLocation;
  nodes:
    | readonly [NamedOperationDefinitionNode, ...NamedFragmentDefinitionNode[]]
    | readonly [NamedFragmentDefinitionNode];
};
async function getDocuments(files: string[]) {
  let errors: CompilerError[] = [];
  let allDocuments: Document[] = [];
  await Promise.all(
    files.map(async (filename) => {
      let { errors, documents } = await extractGraphQLDocumentsContentsFromFile(
        filename
      );
      errors.push(...errors);

      documents.forEach((document) => {
        try {
          let ast = parse(document.document);
          allDocuments.push({
            nodes: getGqlNode(ast),
            loc: document.loc,
            filename,
          });
        } catch (err) {
          if (err instanceof GraphQLError) {
            errors.push({
              filename,
              message: err.message,
              loc: locFromSourceAndGraphQLError(document.loc, err),
            });
          } else {
            errors.push({
              filename,
              message: err.message,
              loc: document.loc,
            });
          }
        }
      });
    })
  );
  return { errors, documents: allDocuments };
}

export const getGeneratedTypes = async ({
  schema,
  directory,
  scalars,
  nonOptionalTypename,
}: Config) => {
  let generatedDirectory = nodePath.join(
    nodePath.join(directory, "__generated__", "ts-gql")
  );

  const files = (
    await globby(["**/*.{ts,tsx}"], {
      cwd: directory,
      absolute: true,
      gitignore: true,
      ignore: ["**/node_modules/**"],
    })
  ).map((x) => slash(x));

  let { errors, documents } = await getDocuments(files);

  let allDocumentsByName: Record<string, Document[]> = {};

  for (let document of documents) {
    let name = document.nodes[0].name.value;
    if (!allDocumentsByName[name]) {
      allDocumentsByName[name] = [];
    }
    allDocumentsByName[name].push(document);
  }
  let uniqueDocumentsByName: Record<string, Document> = {};
  let printCompilerError = getPrintCompilerError();
  let fsOperations: FsOperation[] = [];

  await Promise.all(
    Object.keys(allDocumentsByName).map(async (name) => {
      if (allDocumentsByName[name].length !== 1) {
        let nonUniqueNameErrors = allDocumentsByName[name].map((document) => {
          return {
            filename: document.filename,
            loc: locFromSourceAndGraphQLError(
              document.loc,
              new GraphQLError("", document.nodes[0].name)
            ),
            message: `Multiple ${
              document.nodes[0].kind === "FragmentDefinition"
                ? "fragments"
                : "operations"
            } exist with the name ${document.nodes[0].name.value}`,
          };
        });
        errors.push(...nonUniqueNameErrors);

        let operation = await cachedGenerateErrorModuleFsOperation(
          nodePath.join(generatedDirectory, `${name}.ts`),
          `There ${
            nonUniqueNameErrors.length === 1 ? "is an error" : "are errors"
          } with ${name}\n${(
            await Promise.all(errors.map((x) => printCompilerError(x)))
          ).join("\n")}`
        );
        if (operation) {
          fsOperations.push(operation);
        }
      } else {
        uniqueDocumentsByName[allDocumentsByName[name][0].nodes[0].name.value] =
          allDocumentsByName[name][0];
      }
    })
  );

  try {
    let generatedDirectoryFiles = (await fs.readdir(generatedDirectory))
      .filter((x) => x !== "@schema.d.ts")
      .map((x) => x.replace(/\.ts$/, ""));

    for (let name of generatedDirectoryFiles) {
      if (allDocumentsByName[name] === undefined) {
        fsOperations.push({
          type: "remove",
          filename: nodePath.join(generatedDirectory, name + ".ts"),
        });
      }
    }
  } catch (err) {
    if (err.code !== "ENOENT") {
      throw err;
    }
  }

  let {
    hash: schemaHash,
    operation: schemaOperation,
  } = await cachedGenerateSchemaTypes(schema, generatedDirectory, scalars);

  if (schemaOperation) {
    fsOperations.push(schemaOperation);
  }

  let dependencies = Object.keys(uniqueDocumentsByName).reduce((obj, item) => {
    obj[item] = [];
    return obj;
  }, {} as Record<string, string[]>);

  for (let key in uniqueDocumentsByName) {
    for (let node of uniqueDocumentsByName[key].nodes) {
      visit(node, {
        FragmentSpread(node) {
          let name = node.name.value;
          if (
            !uniqueDocumentsByName[name] ||
            uniqueDocumentsByName[name].nodes[0].kind === "OperationDefinition"
          ) {
            errors.push({
              message: `Fragment ${name} not found`,
              filename: uniqueDocumentsByName[key].filename,
              loc: locFromSourceAndGraphQLError(
                uniqueDocumentsByName[key].loc,
                new GraphQLError("Fragment", [node])
              ),
            });
          } else {
            dependencies[key].push(name);
          }
        },
      });
    }
  }
  await Promise.all(
    Object.keys(uniqueDocumentsByName).map(async (key) => {
      let nodes = uniqueDocumentsByName[key].nodes.concat(
        getFlatDependenciesForItem(dependencies, key).map(
          (x) => uniqueDocumentsByName[x].nodes[0] as FragmentDefinitionNode
        )
      );
      let document = {
        kind: "Document",
        definitions: nodes,
      } as const;

      let gqlErrors = validate(
        schema,
        document,
        nodes[0].kind === "OperationDefinition"
          ? specifiedRules
          : fragmentDocumentRules
      ).map((err) => ({
        filename: uniqueDocumentsByName[key].filename,
        message: err.message,
        loc: locFromSourceAndGraphQLError(uniqueDocumentsByName[key].loc, err),
      }));

      errors.push(...gqlErrors);

      let filename = nodePath.join(
        generatedDirectory,
        `${nodes[0].name.value}.ts`
      );
      let operation = gqlErrors.length
        ? await cachedGenerateErrorModuleFsOperation(
            filename,
            `${uniqueDocumentsByName[key].filename}\nThere ${
              gqlErrors.length === 1 ? "is an error" : "are errors"
            } with ${nodes[0].name.value}\n${(
              await Promise.all(errors.map((x) => printCompilerError(x)))
            ).join("\n")}`
          )
        : await cachedGenerateOperationTypes(
            schema,
            document,
            nodes[0],
            filename,
            schemaHash,
            nodes[0].name!.value,
            nonOptionalTypename
          );
      if (operation) fsOperations.push(operation);
    })
  );
  return {
    fsOperations,
    errors: await Promise.all(errors.map((x) => printCompilerError(x))),
  };
};

function locFromSourceAndGraphQLError(
  loc: FullSourceLocation,
  error: GraphQLError
) {
  if (!error.locations || !error.locations.length) {
    return;
  }
  const gqlLocation = error.locations[0];

  // TODO: look at nodes instead of locations so we can get the start AND end
  return {
    start: {
      line: loc.start.line + gqlLocation.line - 1,
      column:
        gqlLocation.line === 1
          ? loc.start.column + gqlLocation.column + 1
          : gqlLocation.column,
    },
    // end: {
    //   line: loc.start.line + gqlLocation.endToken.line - 1,
    //   column:
    //     (gqlLocation.endToken.line === 1
    //       ? loc.end.column + gqlLocation.endToken.column
    //       : gqlLocation.endToken.column) - 1,
    // },
  };
}

function getFlatDependenciesForItem(
  deps: Record<string, string[]>,
  item: string
): string[] {
  return [
    ...new Set<string>(
      deps[item].concat(
        ...deps[item].map((item) => getFlatDependenciesForItem(deps, item))
      )
    ),
  ];
}

function getGqlNode(ast: DocumentNode) {
  if (ast.definitions.some((x) => x.kind === "OperationDefinition")) {
    if (
      !ast.definitions.every(
        (x) =>
          x.kind === "OperationDefinition" || x.kind === "FragmentDefinition"
      )
    ) {
      throw new ValidationError(
        "This document has nodes that are not operations or fragments"
      );
    }
    let operationNodes = ast.definitions.filter(
      (x): x is OperationDefinitionNode => x.kind === "OperationDefinition"
    );
    if (operationNodes.length !== 1) {
      throw new ValidationError(
        "This document has more than one operation node"
      );
    }
    let [operationNode] = operationNodes;

    if (!operationNode.name) {
      throw new ValidationError("Operations must have names");
    }
    return (ast.definitions as any) as [
      NamedOperationDefinitionNode,
      ...NamedFragmentDefinitionNode[]
    ];
  }
  if (
    ast.definitions.length !== 1 ||
    ast.definitions[0].kind !== "FragmentDefinition"
  ) {
    throw new ValidationError(
      "Documents that do not have an operation must have a single fragment"
    );
  }
  let [fragmentNode] = ast.definitions;
  if (!fragmentNode.name) {
    throw new ValidationError("Fragments must have names");
  }
  return ([fragmentNode] as any) as [NamedFragmentDefinitionNode];
}

class ValidationError extends Error {}
