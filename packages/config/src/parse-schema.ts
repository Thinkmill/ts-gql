import { version } from "graphql/version";
import type { GraphQLSchema } from "graphql/type/schema";
import { lazyRequire } from "lazy-require.macro";
import crypto from "crypto";

function hashSchema(input: string) {
  let md5sum = crypto.createHash("md5");

  md5sum.update(version);
  md5sum.update(input);
  return md5sum.digest("hex");
}

let schemaCache: Record<
  string,
  { schemaHash: string; schema: () => GraphQLSchema }
> = {};

export function parseSchema(filename: string, content: string) {
  let schemaHash = hashSchema(content);
  if (schemaCache[filename]?.schemaHash !== schemaHash) {
    let schema: GraphQLSchema;
    schemaCache[filename] = {
      schemaHash,
      schema: () => {
        if (!schema) {
          schema = uncachedParseSchema(filename, content);
        }
        return schema;
      },
    };
  }
  return schemaCache[filename];
}

function uncachedParseSchema(filename: string, content: string) {
  if (!filename.endsWith(".json")) {
    const { buildSchema } = lazyRequire<
      typeof import("graphql/utilities/buildASTSchema")
    >();

    return buildSchema(content);
  }
  const { buildClientSchema } = lazyRequire<
    typeof import("graphql/utilities/buildClientSchema")
  >();

  let schema = JSON.parse(content);
  const unpackedSchemaJson = schema.data ? schema.data : schema;
  if (!unpackedSchemaJson.__schema) {
    throw new Error(
      `${filename} should contain a valid introspection query result`
    );
  }
  return buildClientSchema(unpackedSchemaJson);
}
