import fs from "fs-extra";
import { printSchema, GraphQLSchema, parse } from "graphql";
import path from "path";
import { codegen } from "./codegen-core";
import * as typescriptPlugin from "@graphql-codegen/typescript";
import { hashString, parseTsGqlMeta } from "./utils";
import { FsOperation } from "./fs-operations";
import {
  wrapFileInIntegrityComment,
  getDoesFileHaveIntegrity,
} from "./integrity";

function generateSchemaTypes(
  schema: GraphQLSchema,
  filename: string,
  schemaHash: string,
  scalars: Record<string, string>
): FsOperation {
  let result = codegen({
    documents: [],
    schema: parse(printSchema(schema)),
    schemaAst: schema,
    config: {},
    filename: "",
    plugins: [
      {
        typescript: {
          enumsAsTypes: true,
          scalars,
          avoidOptionals: true,
          immutableTypes: true,
          nonOptionalTypename: true,
          namingConvention: "keep",
        },
      },
    ],
    pluginMap: { typescript: typescriptPlugin },
  });

  return {
    type: "output",
    filename,
    content: wrapFileInIntegrityComment(
      `/*\nts-gql-meta-begin\n${JSON.stringify(
        { hash: schemaHash },
        null,
        2
      )}\nts-gql-meta-end\n*/\n${result}\nexport interface TSGQLDocuments extends Record<string, import('@ts-gql/tag').TypedDocumentNode<import('@ts-gql/tag').BaseDocumentTypes>> {}`
    ),
  };
}

export async function cachedGenerateSchemaTypes(
  schema: GraphQLSchema,
  directory: string,
  scalars: Record<string, string>
) {
  let printedSchema = printSchema(schema);
  let schemaHash = hashString(printedSchema + JSON.stringify(scalars) + "v2");
  let types: string;
  let filename = path.join(directory, "@schema.d.ts");
  try {
    types = await fs.readFile(filename, "utf8");
  } catch (err) {
    if (err.code === "ENOENT") {
      return {
        hash: schemaHash,
        operation: generateSchemaTypes(schema, filename, schemaHash, scalars),
      };
    }
    throw err;
  }
  if (
    !getDoesFileHaveIntegrity(types) ||
    parseTsGqlMeta(types).hash !== schemaHash
  ) {
    return {
      hash: schemaHash,
      operation: generateSchemaTypes(schema, filename, schemaHash, scalars),
    };
  }
  return { hash: schemaHash };
}
