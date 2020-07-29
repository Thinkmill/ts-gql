import fs from "fs-extra";
import nodePath from "path";
import {
  FragmentDefinitionNode,
  visit,
  validate,
  specifiedRules,
  NoUnusedFragmentsRule,
  GraphQLError,
  ValidationContext,
  ASTVisitor,
  ValidationRule,
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
import { CompilerError, TSGQLDocument } from "./types";
import { codeFrameColumns } from "@babel/code-frame";
import { cachedGenerateIntrospectionResult } from "./introspection-result";
import { locFromSourceAndGraphQLError } from "./utils";
import { getDocuments } from "./get-documents";

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

const SkipNonFirstFragmentsRule: ValidationRule = () => {
  return {
    FragmentDefinition(node, key) {
      if (key !== 0) {
        return null;
      }
    },
  };
};

function FragmentNameValidationRule(context: ValidationContext): ASTVisitor {
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
}

let fragmentDocumentRules = [
  SkipNonFirstFragmentsRule,
  FragmentNameValidationRule,
].concat(specifiedRules.filter((x) => x !== NoUnusedFragmentsRule));

let operationDocumentRules = [SkipNonFirstFragmentsRule].concat(specifiedRules);

export const getGeneratedTypes = async (config: Config) => {
  let generatedDirectory = nodePath.join(
    nodePath.join(config.directory, "__generated__", "ts-gql")
  );

  const files = (
    await globby(["**/*.{ts,tsx}"], {
      cwd: config.directory,
      absolute: true,
      expandDirectories: false,
      ignore: ["**/node_modules/**", "__generated__/ts-gql/*", "**/*.d.ts"],
    })
  ).map((x) => slash(x));

  let { errors, documents } = await getDocuments(
    files,
    nodePath.join(generatedDirectory, "@document-cache.json")
  );

  let allDocumentsByName: Record<string, TSGQLDocument[]> = {};

  for (let document of documents) {
    let name = document.node.name.value;
    if (!allDocumentsByName[name]) {
      allDocumentsByName[name] = [];
    }
    allDocumentsByName[name].push(document);
  }
  let uniqueDocumentsByName: Record<string, TSGQLDocument> = {};
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
              new GraphQLError("", document.node.name)
            ),
            message: `Multiple ${
              document.node.kind === "FragmentDefinition"
                ? "fragments"
                : "operations"
            } exist with the name ${document.node.name.value}`,
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
        uniqueDocumentsByName[allDocumentsByName[name][0].node.name.value] =
          allDocumentsByName[name][0];
      }
    })
  );

  try {
    let generatedDirectoryFiles = (await fs.readdir(generatedDirectory))
      .filter((x) => !x.startsWith("@"))
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

  let schemaOperation = await cachedGenerateSchemaTypes(config);

  if (schemaOperation) {
    fsOperations.push(schemaOperation);
  }

  let operation = await cachedGenerateIntrospectionResult(
    config,
    nodePath.join(generatedDirectory, "@introspection.ts")
  );

  if (operation) {
    fsOperations.push(operation);
  }

  let dependencies = Object.keys(uniqueDocumentsByName).reduce((obj, item) => {
    obj[item] = [];
    return obj;
  }, {} as Record<string, string[]>);

  for (let key in uniqueDocumentsByName) {
    let { node } = uniqueDocumentsByName[key];
    visit(node, {
      FragmentSpread(node) {
        let name = node.name.value;
        if (
          !uniqueDocumentsByName[name] ||
          uniqueDocumentsByName[name].node.kind === "OperationDefinition"
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
  await Promise.all(
    Object.keys(uniqueDocumentsByName).map(async (key) => {
      let flatDependencies = getFlatDependenciesForItem(dependencies, key).map(
        (x) => uniqueDocumentsByName[x].node as FragmentDefinitionNode
      );

      let nodes = [uniqueDocumentsByName[key].node];
      nodes.push(...flatDependencies);
      let document = {
        kind: "Document",
        definitions: nodes,
      } as const;

      let gqlErrors = validate(
        config.schema,
        document,
        nodes[0].kind === "OperationDefinition"
          ? operationDocumentRules
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
        : await cachedGenerateOperationTypes(config, document, filename);
      if (operation) fsOperations.push(operation);
    })
  );
  return {
    fsOperations,
    errors: await Promise.all(errors.map((x) => printCompilerError(x))),
  };
};

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
