import fs from "fs-extra";
import {
  GraphQLSchema,
  DocumentNode,
  parse,
  printSchema,
  OperationDefinitionNode,
  FragmentDefinitionNode,
} from "graphql";
import { codegen } from "./codegen-core";
import path from "path";
import * as typescriptOperationsPlugin from "@graphql-codegen/typescript-operations";
import { hashString, parseTsGqlMeta } from "./utils";

async function writeOperationTypes(
  schema: GraphQLSchema,
  operation: DocumentNode,
  operationNode: OperationDefinitionNode | FragmentDefinitionNode,
  filename: string,
  srcFilename: string,
  operationHash: string,
  operationName: string
) {
  let result = codegen({
    documents: [{ document: operation }],
    schema: parse(printSchema(schema)),
    schemaAst: schema,
    config: {},
    filename: "",

    plugins: [
      {
        "typescript-operations": {
          namespacedImportName: "SchemaTypes",
          immutableTypes: true,
          noExport: true,
          nonOptionalTypename: true,
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
  await fs.outputFile(
    filename,
    `/*\nts-gql-meta-begin\n${JSON.stringify(
      {
        hash: operationHash,
        filename: path.relative(path.dirname(filename), srcFilename),
        partial: `${operationType} ${operationName}`,
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
}>

export const document = ${JSON.stringify(
      operation,
      (key, value) => (key === "loc" ? undefined : value),
      2
    )}
`
  );
}

export async function ensureOperationTypesAreWritten(
  schema: GraphQLSchema,
  operation: DocumentNode,
  operationNode: OperationDefinitionNode | FragmentDefinitionNode,
  filename: string,
  srcFilename: string,
  schemaHash: string,
  operationName: string
) {
  let operationHash = hashString(schemaHash + JSON.stringify(operation) + "v3");
  let types: string;
  try {
    types = await fs.readFile(filename, "utf8");
  } catch (err) {
    if (err.code === "ENOENT") {
      await writeOperationTypes(
        schema,
        operation,
        operationNode,
        filename,
        srcFilename,
        operationHash,
        operationName
      );
      return true;
    }
    throw err;
  }
  let meta = parseTsGqlMeta(types);
  if (meta.hash !== operationHash) {
    await writeOperationTypes(
      schema,
      operation,
      operationNode,
      filename,
      srcFilename,
      operationHash,
      operationName
    );
    return true;
  }
  return false;
}
