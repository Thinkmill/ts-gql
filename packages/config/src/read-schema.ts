import { buildClientSchema, buildSchema, version } from "graphql";
import crypto from "crypto";

export function hashSchema(input: string) {
  let md5sum = crypto.createHash("md5");

  md5sum.update(version);
  md5sum.update(input);
  return md5sum.digest("hex");
}

export function parseSchema(filename: string, content: string) {
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
