import { buildClientSchema, buildSchema } from "graphql";
import fs from "fs";
import { promisify } from "util";

let readFile = promisify(fs.readFile);

function parseSchema(filename: string, content: string) {
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

export function readSchemaSync(schemaFilename: string) {
  let contents = fs.readFileSync(schemaFilename, "utf8");
  return parseSchema(schemaFilename, contents);
}

export async function readSchema(schemaFilename: string) {
  let contents = await readFile(schemaFilename, "utf8");
  return parseSchema(schemaFilename, contents);
}
