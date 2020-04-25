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

function writeOperationTypes(
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

  let isAtLeastOneVariableRequired = (
    operationNode.variableDefinitions || []
  ).some((x) => x.type.kind === "NonNullType");

  if (isAtLeastOneVariableRequired) {
    operationType += "-with-required-variables";
  }
  fs.outputFileSync(
    filename,
    `/*\nts-gql-meta-begin\n${JSON.stringify(
      {
        hash: operationHash,
        filename: path.relative(path.dirname(filename), srcFilename),
        document: operation.document,
      },
      null,
      2
    )}\nts-gql-meta-end\n*/\n\nimport * as SchemaTypes from "./@schema";\n\n${result}
declare module "@ts-gql/tag" {
  interface Documents {
    ${operationName}: {
      document: ${JSON.stringify(operation.document)};
      type: ${JSON.stringify(operationType)};
      result: ${operationName}Query;
      variables: ${
        operationNode.variableDefinitions &&
        operationNode.variableDefinitions.length
          ? operationName + "QueryVariables"
          : undefined
      };
    };
  }
}\n`
  );
}

export function ensureOperationTypesAreWritten(
  schema: GraphQLSchema,
  operation: { ast: DocumentNode; document: string },
  operationNode: OperationDefinitionNode,
  filename: string,
  srcFilename: string,
  schemaHash: string,
  operationName: string
) {
  let operationHash = hashString(schemaHash + operation.document);
  let types: string;
  try {
    types = fs.readFileSync(filename, "utf8");
  } catch (err) {
    if (err.code === "ENOENT") {
      writeOperationTypes(
        schema,
        operation,
        operationNode,
        filename,
        srcFilename,
        operationHash,
        operationName
      );
    }
    throw err;
  }
  let meta = parseTsGqlMeta(types);
  if (meta.hash !== operationHash) {
    writeOperationTypes(
      schema,
      operation,
      operationNode,
      filename,
      srcFilename,
      operationHash,
      operationName
    );
  }
}
