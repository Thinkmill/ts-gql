import fs from "fs-extra";
import type { GraphQLSchema } from "graphql";
import { parseTsGqlMeta } from "./utils";
import { FsOperation } from "./fs-operations";
import {
  getDoesFileHaveIntegrity,
  wrapFileInIntegrityComment,
} from "./integrity";
import { Config } from "@ts-gql/config";

async function generateIntrospectionResult(
  schema: GraphQLSchema,
  schemaHash: string,
  filename: string
): Promise<FsOperation> {
  const {
    introspectionFromSchema,
  } = require("graphql/utilities/introspectionFromSchema") as typeof import("graphql/utilities/introspectionFromSchema");
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
export const result = JSON.parse(${JSON.stringify(
      JSON.stringify(introspection)
    )})
`),
  };
}

export async function cachedGenerateIntrospectionResult(
  config: Config,
  filename: string
) {
  let schemaHash = config.schemaHash + "v1";
  let types: string;
  try {
    types = await fs.readFile(filename, "utf8");
  } catch (err) {
    if (err.code === "ENOENT") {
      return generateIntrospectionResult(config.schema(), schemaHash, filename);
    }
    throw err;
  }
  if (
    !getDoesFileHaveIntegrity(types) ||
    parseTsGqlMeta(types).hash !== schemaHash
  ) {
    return generateIntrospectionResult(config.schema(), schemaHash, filename);
  }
}
