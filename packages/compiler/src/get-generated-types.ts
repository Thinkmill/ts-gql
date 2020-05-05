import fs from "fs-extra";
import path from "path";
import {
  DocumentNode,
  OperationDefinitionNode,
  parse,
  FragmentDefinitionNode,
  visit,
  GraphQLSchema,
} from "graphql";
import {
  parse as babelParse,
  transformFromAstAsync,
  PluginObj,
} from "@babel/core";
import globby from "globby";
import { cachedGenerateSchemaTypes } from "./schema-types";
import { cachedGenerateOperationTypes } from "./operation-types";
import { FsOperation } from "./fs-operations";

export const getGeneratedTypes = async ({
  schema,
  directory,
}: {
  schema: GraphQLSchema;
  directory: string;
}) => {
  let generatedDirectory = path.join(
    path.join(directory, "__generated__", "ts-gql")
  );

  const files = await globby(["**/*.{ts,tsx}"], {
    cwd: directory,
    absolute: true,
  });

  let nodeMap: Record<
    string,
    {
      filename: string;
      nodes:
        | readonly [OperationDefinitionNode, ...FragmentDefinitionNode[]]
        | readonly [FragmentDefinitionNode];
    }
  > = {};

  let errors: string[] = [];

  await Promise.all(
    files.map(async (file) => {
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
                      try {
                        let content = path.node.quasi.quasis[0].value.cooked!;
                        let ast: DocumentNode | undefined;
                        ast = parse(content);
                        if (ast) {
                          let nodes = getGqlNode(ast);
                          let val = nodes[0].name!.value;
                          if (nodeMap[val]) {
                            errors.push(
                              path
                                .buildCodeFrameError(
                                  `An operation already exists with the name ${val}`
                                )
                                .toString()
                            );
                          }
                          nodeMap[val] = { nodes, filename: file };
                        }
                      } catch (err) {
                        errors.push(
                          path.buildCodeFrameError(err.message).toString()
                        );
                      }
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
          errors.push(err.toString());
        }
      }
    })
  );

  let fsOperations: FsOperation[] = [];

  let generatedDirectoryFiles = (await fs.readdir(generatedDirectory))
    .filter((x) => x !== "@schema.d.ts")
    .map((x) => x.replace(/\.ts$/, ""));

  for (let name of generatedDirectoryFiles) {
    if (nodeMap[name] === undefined) {
      fsOperations.push({
        type: "remove",
        filename: path.join(generatedDirectory, name + ".ts"),
      });
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

      let operation = await cachedGenerateOperationTypes(
        schema,
        {
          kind: "Document",
          definitions: nodes,
        },
        nodes[0],
        path.join(generatedDirectory, `${nodes[0].name!.value}.ts`),
        nodeMap[key].filename,
        schemaHash,
        nodes[0].name!.value
      );
      if (operation) fsOperations.push(operation);
    })
  );
  return { fsOperations, errors };
};

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
