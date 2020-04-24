import fs from "fs-extra";
import { GraphQLSchema, DocumentNode, parse, printSchema } from "graphql";
import { codegen } from "./codegen-core";
import path from "path";
import * as typescriptOperationsPlugin from "@graphql-codegen/typescript-operations";
import { hashString, parseTsGqlMeta } from "./utils";

function writeOperationTypes(
  schema: GraphQLSchema,
  operation: { ast: DocumentNode; document: string },
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
        },
      },
    ],
    pluginMap: { "typescript-operations": typescriptOperationsPlugin },
  });
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
      type: ${JSON.stringify("query")};
      result: ${operationName}Query;
      variables: ${operationName}QueryVariables;
    };
  }
}\n`
  );
}

export function ensureOperationTypesAreWritten(
  schema: GraphQLSchema,
  operation: { ast: DocumentNode; document: string },
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
      filename,
      srcFilename,
      operationHash,
      operationName
    );
  }
}
