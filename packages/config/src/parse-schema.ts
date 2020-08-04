import { buildSchema } from "graphql/utilities/buildASTSchema";
import { buildClientSchema } from "graphql/utilities/buildClientSchema";
import { version } from "graphql/version";
import { GraphQLSchema } from "graphql/type/schema";
import crypto from "crypto";

function hashSchema(input: string) {
  let md5sum = crypto.createHash("md5");

  md5sum.update(version);
  md5sum.update(input);
  return md5sum.digest("hex");
}

let schemaCache: Record<
  string,
  { schemaHash: string; schema: GraphQLSchema }
> = {};

export function parseSchema(filename: string, content: string) {
  let schemaHash = hashSchema(content);
  if (schemaCache[filename]?.schemaHash !== schemaHash) {
    schemaCache[filename] = {
      schemaHash,
      schema: uncachedParseSchema(filename, content),
    };
  }
  return schemaCache[filename];
}

function uncachedParseSchema(filename: string, content: string) {
  if (!filename.endsWith(".json")) {
    return buildSchema(content);
  }
  let schema = JSON.parse(content);
  const unpackedSchemaJson = schema.data ? schema.data : schema;
  if (!unpackedSchemaJson.__schema) {
    throw new Error(
      `${filename} should contain a valid introspection query result`
    );
  }
  return buildClientSchema(unpackedSchemaJson);
}
