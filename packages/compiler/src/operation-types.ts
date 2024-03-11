import * as fs from "./fs";
import { DocumentNode, ExecutableDefinitionNode } from "graphql";
import { codegen } from "./codegen-core";
import { hashString, parseTsGqlMeta } from "./utils";
import { FsOperation } from "./fs-operations";
import {
  getDoesFileHaveIntegrity,
  wrapFileInIntegrityComment,
} from "./integrity";
import stripAnsi from "strip-ansi";
import { Config } from "@ts-gql/config";
import { lazyRequire } from "lazy-require.macro";
import { inlineIntoFirstOperationOrFragment } from "./inline-fragments";

function getUsedFragments(node: ExecutableDefinitionNode) {
  const visit = lazyRequire<typeof import("graphql/language/visitor")>().visit;
  const usedFragments = new Set<string>();
  visit(node, {
    FragmentSpread(node) {
      usedFragments.add(node.name.value);
    },
  });
  return [...usedFragments];
}

async function generateOperationTypes(
  config: Config,
  operation: DocumentNode,
  filename: string,
  operationHash: string
): Promise<FsOperation> {
  let result = codegen({
    documents: [
      {
        document: inlineIntoFirstOperationOrFragment(
          operation,
          config.schema()
        ),
      },
    ],
    schemaAst: config.schema(),
    config: {},
    filename: "",

    plugins: [
      {
        "typescript-operations": {
          namespacedImportName: "SchemaTypes",
          immutableTypes: config.readonlyTypes,
          noExport: true,
          avoidOptionals: {
            field: true,
            inputValue: false,
            object: false,
            defaultValue: false,
          },
          nonOptionalTypename: config.addTypename,
          skipTypename: !config.addTypename,
          namingConvention: "keep",
          scalars: config.scalars,
        },
      },
    ],
    pluginMap: {
      "typescript-operations":
        lazyRequire<typeof import("@graphql-codegen/typescript-operations")>(),
    },
  }).replace(/(SchemaTypes\.Scalars\['[^']+'\])\['(?:input|output)'\]/g, "$1");

  const operationNode = operation.definitions[0];
  if (
    !operationNode ||
    (operationNode.kind !== "FragmentDefinition" &&
      operationNode.kind !== "OperationDefinition")
  ) {
    throw new Error(
      "First node in document does not exist or is not a fragment or operation"
    );
  }
  if (!operationNode.name) {
    throw new Error("name not found on OperationDefinition");
  }
  const operationType =
    operationNode.kind === "OperationDefinition"
      ? operationNode.operation
      : "fragment";

  let upperCaseOperationType =
    operationType.charAt(0).toUpperCase() + operationType.slice(1);
  const usedFragments = getUsedFragments(operationNode);
  return {
    type: "output",
    filename,
    content:
      wrapFileInIntegrityComment(`/*\nts-gql-meta-begin\n${JSON.stringify(
        { hash: operationHash },
        null,
        2
      )}\nts-gql-meta-end\n*/\n\nimport * as SchemaTypes from "./@schema";\nimport { TypedDocumentNode } from "@ts-gql/tag";\n\n${result}


export type type = TypedDocumentNode<{
  type: ${JSON.stringify(operationType)};
  result: ${operationNode.name.value + upperCaseOperationType};${
        operationType === "fragment"
          ? `\n  name: ${JSON.stringify(operationNode.name.value)};`
          : `\n  variables: ${
              operationNode.variableDefinitions?.length
                ? operationNode.name.value +
                  upperCaseOperationType +
                  "Variables"
                : `{}`
            };`
      }
  documents: SchemaTypes.TSGQLDocuments;
  fragments: SchemaTypes.TSGQLRequiredFragments<${JSON.stringify(
    usedFragments.length === 0
      ? "none"
      : Object.fromEntries(usedFragments.map((x) => [x, true]))
  )}>
}>

declare module "./@schema" {
  interface TSGQLDocuments {
    ${operationNode.name.value}: type;
  }
}

export const document = JSON.parse(${JSON.stringify(
        JSON.stringify(operation, (key, value) =>
          key === "loc" ? undefined : value
        )
      )})
`),
  };
}

function generateErrorModuleFsOperation(
  filename: string,
  hash: string,
  error: string
) {
  return {
    type: "output" as const,
    filename,
    content:
      wrapFileInIntegrityComment(`/*\nts-gql-meta-begin\n${JSON.stringify(
        { hash },
        null,
        2
      )}\nts-gql-meta-end\n*/

export type type = never;

throw new Error(typeof window === 'undefined' ? ${JSON.stringify(
        stripAnsi(error)
      )} : ${JSON.stringify(error)});
`),
  };
}

export async function cachedGenerateErrorModuleFsOperation(
  filename: string,
  error: string
) {
  let hash = hashString(error + "v1");
  let types: string;
  try {
    types = await fs.readFile(filename, "utf8");
  } catch (err) {
    if (err.code === "ENOENT") {
      return generateErrorModuleFsOperation(filename, hash, error);
    }
    throw err;
  }
  if (!getDoesFileHaveIntegrity(types) || parseTsGqlMeta(types).hash !== hash) {
    return generateErrorModuleFsOperation(filename, hash, error);
  }
}

export async function cachedGenerateOperationTypes(
  config: Config,
  operation: DocumentNode,
  filename: string,
  operationHash: string
) {
  let types: string;
  try {
    types = await fs.readFile(filename, "utf8");
  } catch (err) {
    if (err.code === "ENOENT") {
      return generateOperationTypes(config, operation, filename, operationHash);
    }
    throw err;
  }
  if (
    !getDoesFileHaveIntegrity(types) ||
    parseTsGqlMeta(types).hash !== operationHash
  ) {
    return generateOperationTypes(config, operation, filename, operationHash);
  }
}
