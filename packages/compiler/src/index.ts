import fs from "fs-extra";
import path from "path";
import {
  DocumentNode,
  OperationDefinitionNode,
  parse,
  FragmentDefinitionNode,
  visit,
} from "graphql";
import { findPkgJsonFieldUp } from "find-pkg-json-field-up";
import {
  parse as babelParse,
  transformFromAstAsync,
  PluginObj,
} from "@babel/core";
import globby from "globby";
import { ensureSchemaTypesAreWritten } from "./schema-types";
import { getSchemaFromOptions } from "./get-schema";
import { ensureOperationTypesAreWritten } from "./operation-types";

async function getConfig(cwd: string) {
  let { packageJson, directory } = await findPkgJsonFieldUp("ts-gql", cwd);
  let field = packageJson["ts-gql"];
  if (
    typeof field === "object" &&
    field !== null &&
    typeof field.schema === "string"
  ) {
    return {
      schema: await getSchemaFromOptions(path.resolve(directory, field.schema)),
      directory,
    };
  }
  throw new Error("Config not found");
}

(async () => {
  let { schema, directory } = await getConfig(process.cwd());
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

  await Promise.all(
    files.map(async (file) => {
      let content = await fs.readFile(file, "utf8");
      if (/gql\s*`/.test(content)) {
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
                          throw new ValidationError(
                            `An operation already exists with the name ${val}`
                          );
                        }
                        nodeMap[val] = { nodes, filename: file };
                      }
                    } catch (err) {
                      throw path.buildCodeFrameError(err.message);
                    }
                  }
                },
              },
            }),
          ],
          babelrc: false,
          code: false,
          configFile: false,
        });
      }
    })
  );

  let { hash: schemaHash } = ensureSchemaTypesAreWritten(
    schema,
    generatedDirectory,
    {}
  );

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
            throw new ValidationError(`Fragment ${name} not found`);
          }
          dependencies[key].push(name);
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

      await ensureOperationTypesAreWritten(
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
    })
  );
})();

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
