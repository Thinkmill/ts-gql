import fs from "fs-extra";
import nodePath from "path";
import {
  DocumentNode,
  OperationDefinitionNode,
  parse,
  FragmentDefinitionNode,
  visit,
  validate,
  specifiedRules,
  NoUnusedFragmentsRule,
  GraphQLError,
} from "graphql";
import {
  parse as babelParse,
  transformFromAstAsync,
  PluginObj,
} from "@babel/core";
import stripAnsi from "strip-ansi";
import slash from "slash";
import globby from "globby";
import { cachedGenerateSchemaTypes } from "./schema-types";
import { cachedGenerateOperationTypes } from "./operation-types";
import { FsOperation } from "./fs-operations";
import { Config } from "@ts-gql/config";

type Position = {
  line: number;
  column: number;
};

type SourceLocation = {
  start: Position;
  end?: Position;
};

type CompilerError = {
  message: string;
  loc?: SourceLocation;
};

type CompilerErrors = {
  [filename: string]: CompilerError[];
};

async function printCompilerErrors(compilerErrors: CompilerErrors) {
  await Promise.all(
    Object.keys(compilerErrors).map(async (filename) => {
      let errors = compilerErrors[filename];
      if (errors.length) {
        await fs.readFile(filename);
      }
    })
  );
}

let fragmentDocumentRules = specifiedRules.filter(
  (x) => x !== NoUnusedFragmentsRule
);

async function extractGraphQLDocumentsContentsFromFile(file: string) {
  let errors: CompilerError[] = [];
  let documents: { loc: SourceLocation; document: string }[] = [];
  let content = await fs.readFile(file, "utf8");
  if (/gql\s*`/.test(content)) {
    try {
      let ast = babelParse(content, {
        filename: file,
        rootMode: "upward-optional",
      })!;

      await transformFromAstAsync(ast, content, {
        plugins: [
          (): PluginObj => ({
            visitor: {
              TaggedTemplateExpression(path) {
                let isGqlTag =
                  path.node.tag.type === "Identifier" &&
                  path.node.tag.name === "gql";
                let hasNoInterpolations =
                  path.node.quasi.quasis.length === 1 &&
                  path.node.quasi.expressions.length === 0;

                // TODO: verify operation name === import
                let parentIsAs =
                  path.parent.type === "TSAsExpression" &&
                  path.parent.typeAnnotation.type === "TSImportType";

                if (isGqlTag && hasNoInterpolations && parentIsAs) {
                  documents.push({
                    loc: path.node.quasi.loc!,
                    document: path.node.quasi.quasis[0].value.cooked!,
                  });
                }
              },
            },
          }),
        ],
        babelrc: false,
        code: false,
        configFile: false,
        filename: file,
      });
    } catch (err) {
      errors.push({ message: err.message, loc: err.loc });
    }
    return { errors, filename: file, documents };
  }
}

async function buildNodeMap(files: string[], directory: string) {
  await Promise.all(files.map(async (file) => {}));
}

export const getGeneratedTypes = async ({ schema, directory }: Config) => {
  let generatedDirectory = nodePath.join(
    nodePath.join(directory, "__generated__", "ts-gql")
  );

  const files = await globby(["**/*.{ts,tsx}"], {
    cwd: directory,
    absolute: true,
    gitignore: true,
    ignore: ["**/node_modules/**"],
  });

  let nodeMap: Record<
    string,
    {
      filename: string;
      makeFrameError: (error: GraphQLError) => string;
      nodes:
        | readonly [OperationDefinitionNode, ...FragmentDefinitionNode[]]
        | readonly [FragmentDefinitionNode];
    }
  > = {};

  let errors: string[] = [];

  let fsOperations: FsOperation[] = [];

  try {
    let generatedDirectoryFiles = (await fs.readdir(generatedDirectory))
      .filter((x) => x !== "@schema.d.ts")
      .map((x) => x.replace(/\.ts$/, ""));

    for (let name of generatedDirectoryFiles) {
      if (nodeMap[name] === undefined) {
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
  } = await cachedGenerateSchemaTypes(schema, generatedDirectory, {});

  if (schemaOperation) {
    fsOperations.push(schemaOperation);
  }

  let dependencies = Object.keys(nodeMap).reduce((obj, item) => {
    obj[item] = [];
    return obj;
  }, {} as Record<string, string[]>);

  for (let key in nodeMap) {
    for (let node of nodeMap[key].nodes) {
      visit(node, {
        FragmentSpread(node) {
          let name = node.name.value;
          if (
            !nodeMap[name] ||
            nodeMap[name].nodes[0].kind === "OperationDefinition"
          ) {
            errors.push(`Fragment ${name} not found`);
          } else {
            dependencies[key].push(name);
          }
        },
      });
    }
  }
  await Promise.all(
    Object.keys(nodeMap).map(async (key) => {
      let nodes = nodeMap[key].nodes.concat(
        getFlatDependenciesForItem(dependencies, key).map(
          (x) => nodeMap[x].nodes[0] as FragmentDefinitionNode
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
      ).map((err) =>
        // TODO: make this better
        nodeMap[key].makeFrameError(err)
      );

      // TODO: make into proper validation thing
      if (
        nodes[0].kind === "FragmentDefinition" &&
        (!nodes[0].name || !/.+_.+/.test(nodes[0].name.value))
      ) {
        errors.push(
          nodeMap[key].makeFrameError(
            // @ts-ignore
            {
              message:
                "Fragment names must be in the format ComponentName_propName",
            }
          )
        );
      }

      if (gqlErrors.length) {
        errors.push(...gqlErrors);
      }
      let operation = await cachedGenerateOperationTypes(
        schema,
        document,
        nodes[0],
        nodePath.join(generatedDirectory, `${nodes[0].name!.value}.ts`),
        schemaHash,
        nodes[0].name!.value,
        gqlErrors.length
          ? `${nodeMap[key].filename}\nThere ${
              gqlErrors.length === 1 ? "is an error" : "are errors"
            } with ${nodes[0].name!.value}\n${stripAnsi(gqlErrors.join("\n"))}`
          : undefined
      );
      if (operation) fsOperations.push(operation);
    })
  );
  return { fsOperations, errors };
};

function locFromSourceAndGraphQLError(
  loc: SourceLocation,
  error: GraphQLError
) {
  if (!error.locations || !error.locations.length) {
    return;
  }
  const location = error.locations[0];

  let line;
  let column;
  if (location.line === 1) {
    line = loc.start.line;
    column = loc.end.column + location.column;
  } else {
    line = loc.start.line + location.line - 1;
    column = location.column - 1;
  }

  return {
    line,
    column,
  };
}

function getFlatDependenciesForItem(
  deps: Record<string, string[]>,
  item: string
): string[] {
  return deps[item].concat(
    ...deps[item].map((item) => getFlatDependenciesForItem(deps, item))
  );
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
    return ast.definitions as [
      OperationDefinitionNode,
      ...FragmentDefinitionNode[]
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
  return [fragmentNode] as const;
}

class ValidationError extends Error {}
