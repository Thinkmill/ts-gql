import fs from "fs-extra";
import {
  GraphQLSchema,
  DocumentNode,
  parse,
  printSchema,
  OperationDefinitionNode,
} from "graphql";
import { codegen } from "./codegen-core";
import path from "path";
import * as typescriptOperationsPlugin from "@graphql-codegen/typescript-operations";
import { hashString, parseTsGqlMeta } from "./utils";

async function writeOperationTypes(
  schema: GraphQLSchema,
  operation: { ast: DocumentNode; document: string },
  operationNode: OperationDefinitionNode,
  filename: string,
  srcFilename: string,
  operationHash: string,
  operationName: string
) {
  let result = codegen({
    documents: [{ document: operation.ast }],
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

  let operationType = operationNode.operation;

  let upperCaseOperationName =
    operationNode.operation.charAt(0).toUpperCase() +
    operationNode.operation.slice(1);
  await fs.outputFile(
    filename,
    `/*\nts-gql-meta-begin\n${JSON.stringify(
      {
        hash: operationHash,
        filename: path.relative(path.dirname(filename), srcFilename),
        partial: `${operationNode.operation} ${operationName}`,
      },
      null,
      2
    )}\nts-gql-meta-end\n*/\n\nimport * as SchemaTypes from "./@schema";\n\n${result}

declare module "@ts-gql/tag" {
  interface Documents {
    ${operationName}: {
      document: ${JSON.stringify(operation.document)};
      type: ${JSON.stringify(operationType)};
      result: ${operationName + upperCaseOperationName};${
      // @ts-ignore
      operationType === "fragment"
        ? ""
        : `\n      variables: ${
            operationName + upperCaseOperationName + "Variables"
          };`
    }
    };
  }
}
`
  );
}

export async function ensureOperationTypesAreWritten(
  schema: GraphQLSchema,
  operation: { ast: DocumentNode; document: string },
  operationNode: OperationDefinitionNode,
  filename: string,
  srcFilename: string,
  schemaHash: string,
  operationName: string
) {
  let operationHash = hashString(schemaHash + operation.document + "v2");
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
