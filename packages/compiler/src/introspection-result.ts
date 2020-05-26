import fs from "fs-extra";
import { GraphQLSchema, introspectionFromSchema } from "graphql";
import { hashString, parseTsGqlMeta } from "./utils";
import { FsOperation } from "./fs-operations";
import {
  getDoesFileHaveIntegrity,
  wrapFileInIntegrityComment,
} from "./integrity";

async function generateIntrospectionResult(
  schema: GraphQLSchema,
  schemaHash: string,
  filename: string
): Promise<FsOperation> {
  const introspection = introspectionFromSchema(schema, {
    descriptions: false,
  });
  return {
    type: "output",
    filename,
    content: wrapFileInIntegrityComment(`/*\nts-gql-meta-begin\n${JSON.stringify(
      {
        hash: schemaHash,
      },
      null,
      2
    )}\nts-gql-meta-end\n*/\n
export const result = ${JSON.stringify(introspection, null, 2)}
`),
  };
}

export async function cachedGenerateIntrospectionResult(
  schema: GraphQLSchema,
  filename: string,
  schemaHash: string
) {
  let operationHash = hashString(schemaHash + "v1");
  let types: string;
  try {
    types = await fs.readFile(filename, "utf8");
  } catch (err) {
    if (err.code === "ENOENT") {
      return generateIntrospectionResult(schema, schemaHash, filename);
    }
    throw err;
  }
  if (
    !getDoesFileHaveIntegrity(types) ||
    parseTsGqlMeta(types).hash !== operationHash
  ) {
    return generateIntrospectionResult(schema, schemaHash, filename);
  }
}
