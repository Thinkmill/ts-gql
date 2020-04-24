import fs from "fs-extra";
import { printSchema, GraphQLSchema, parse } from "graphql";
import path from "path";
import { codegen } from "./codegen-core";
import * as typescriptPlugin from "@graphql-codegen/typescript";
import { hashString, parseTsGqlMeta } from "./utils";

function writeSchemaTypes(
  schema: GraphQLSchema,
  filename: string,
  schemaHash: string
) {
  let result = codegen({
    documents: [],
    schema: parse(printSchema(schema)),
    schemaAst: schema,
    config: {},
    filename: "",
    plugins: [
      {
        typescript: {},
      },
    ],
    pluginMap: { typescript: typescriptPlugin },
  });
  fs.outputFileSync(
    filename,
    `/*\nts-gql-meta-begin\n${JSON.stringify(
      { hash: schemaHash },
      null,
      2
    )}\nts-gql-meta-end\n*/\n${result}`
  );
}

export function ensureSchemaTypesAreWritten(
  schema: GraphQLSchema,
  directory: string
) {
  let printedSchema = printSchema(schema);
  let schemaHash = hashString(printedSchema);
  let types: string;
  let filename = path.join(directory, "@schema.d.ts");
  try {
    types = fs.readFileSync(filename, "utf8");
  } catch (err) {
    if (err.code === "ENOENT") {
      writeSchemaTypes(schema, filename, schemaHash);
      return schemaHash;
    }
    throw err;
  }
  let meta = parseTsGqlMeta(types);
  if (meta.hash !== schemaHash) {
    writeSchemaTypes(schema, filename, schemaHash);
  }
  return schemaHash;
}
