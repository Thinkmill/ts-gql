import fs from "fs-extra";
import {
  DocumentNode,
  parse,
  printSchema,
  OperationDefinitionNode,
  FragmentDefinitionNode,
} from "graphql";
import { codegen } from "./codegen-core";
import * as typescriptOperationsPlugin from "@graphql-codegen/typescript-operations";
import { hashString, parseTsGqlMeta } from "./utils";
import { FsOperation } from "./fs-operations";
import {
  getDoesFileHaveIntegrity,
  wrapFileInIntegrityComment,
} from "./integrity";
import stripAnsi from "strip-ansi";
import { Config } from "@ts-gql/config";

async function generateOperationTypes(
  config: Config,
  operation: DocumentNode,
  operationNode: OperationDefinitionNode | FragmentDefinitionNode,
  filename: string,
  operationHash: string,
  operationName: string
): Promise<FsOperation> {
  let result = codegen({
    documents: [{ document: operation }],
    schema: parse(printSchema(config.schema)),
    schemaAst: config.schema,
    config: {},
    filename: "",

    plugins: [
      {
        "typescript-operations": {
          namespacedImportName: "SchemaTypes",
          immutableTypes: config.readonlyTypes,
          avoidOptionals: true,
          noExport: true,
          nonOptionalTypename: config.addTypename,
          skipTypename: !config.addTypename,
          namingConvention: "keep",
        },
      },
    ],
    pluginMap: { "typescript-operations": typescriptOperationsPlugin },
  });

  const operationType =
    operationNode.kind === "OperationDefinition"
      ? operationNode.operation
      : "fragment";

  let upperCaseOperationName =
    operationType.charAt(0).toUpperCase() + operationType.slice(1);
  return {
    type: "output",
    filename,
    content: wrapFileInIntegrityComment(`/*\nts-gql-meta-begin\n${JSON.stringify(
      {
        hash: operationHash,
      },
      null,
      2
    )}\nts-gql-meta-end\n*/\n\nimport * as SchemaTypes from "./@schema";\nimport { TypedDocumentNode } from "@ts-gql/tag";\n\n${result}

export type type = TypedDocumentNode<{
  type: ${JSON.stringify(operationType)};
  result: ${operationName + upperCaseOperationName};${
      operationType === "fragment"
        ? ""
        : `\n  variables: ${
            operationName + upperCaseOperationName + "Variables"
          };`
    }
  documents: SchemaTypes.TSGQLDocuments;
}>

declare module "./@schema" {
  interface TSGQLDocuments {
    ${operationName}: type;
  }
}

export const document = ${JSON.stringify(
      operation,
      (key, value) => (key === "loc" ? undefined : value),
      2
    )}
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
    content: wrapFileInIntegrityComment(`/*\nts-gql-meta-begin\n${JSON.stringify(
      {
        hash,
      },
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
  operationNode: OperationDefinitionNode | FragmentDefinitionNode,
  filename: string,
  schemaHash: string,
  operationName: string
) {
  let operationHash = hashString(
    schemaHash +
      JSON.stringify(operation) +
      config.addTypename +
      "v6" +
      config.readonlyTypes
  );
  let types: string;
  try {
    types = await fs.readFile(filename, "utf8");
  } catch (err) {
    if (err.code === "ENOENT") {
      return generateOperationTypes(
        config,
        operation,
        operationNode,
        filename,
        operationHash,
        operationName
      );
    }
    throw err;
  }
  if (
    !getDoesFileHaveIntegrity(types) ||
    parseTsGqlMeta(types).hash !== operationHash
  ) {
    return generateOperationTypes(
      config,
      operation,
      operationNode,
      filename,
      operationHash,
      operationName
    );
  }
}
