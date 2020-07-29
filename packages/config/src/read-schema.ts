import { buildClientSchema, buildSchema, version } from "graphql";
import fs from "fs";
import { promisify } from "util";
import crypto from "crypto";
import { RawConfig } from ".";

let readFile = promisify(fs.readFile);

function hashSchema(input: string) {
  let md5sum = crypto.createHash("md5");

  md5sum.update(version);
  md5sum.update(input);
  return md5sum.digest("hex");
}

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

export function readSchemaSync(rawConfig: RawConfig) {
  let contents = fs.readFileSync(rawConfig.schema, "utf8");
  return {
    schemaHash: hashSchema(contents),
    schema: parseSchema(rawConfig.schema, contents),
  };
}

export async function readSchema(rawConfig: RawConfig) {
  let contents = await readFile(rawConfig.schema, "utf8");
  return {
    schemaHash: hashSchema(contents),
    schema: parseSchema(rawConfig.schema, contents),
  };
}
