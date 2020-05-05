import { buildClientSchema, GraphQLSchema, buildSchema } from "graphql";
import fs from "fs";

// https://github.com/apollographql/eslint-plugin-graphql

function initSchema(schema: any) {
  const unpackedSchemaJson = schema.data ? schema.data : schema;
  if (!unpackedSchemaJson.__schema) {
    throw new Error("Please pass a valid GraphQL introspection query result.");
  }
  return buildClientSchema(unpackedSchemaJson);
}

export function getSchemaFromOptions(schemaFilename: string) {
  // Validate and unpack schema
  let schema: GraphQLSchema;
  let contents = fs.readFileSync(schemaFilename, "utf8");
  schema = schemaFilename.endsWith(".json")
    ? initSchema(JSON.parse(contents))
    : buildSchema(contents);

  return schema;
}
