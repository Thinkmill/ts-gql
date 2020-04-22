import {
  buildClientSchema,
  IntrospectionQuery,
  GraphQLSchema,
  buildSchema,
} from "graphql";
import fs from "fs";

// https://github.com/apollographql/eslint-plugin-graphql

const schemaCache: Record<string, GraphQLSchema> = {};

export function getSchemaFromOptions(options: {
  schema?: string | IntrospectionQuery | { data: IntrospectionQuery };
  schemaFilename?: string;
}) {
  const cacheHit = schemaCache[JSON.stringify(options)];
  if (cacheHit) {
    return cacheHit;
  }

  // Validate and unpack schema
  let schema: GraphQLSchema;
  if (options.schema) {
    schema = initSchema(options.schema);
  } else if (options.schemaFilename) {
    let contents = fs.readFileSync(options.schemaFilename, "utf8");
    schema = initSchema(
      options.schemaFilename.endsWith(".json") ? JSON.parse(contents) : contents
    );
  } else {
    throw new Error("Please provide GraphQL a schema");
  }

  schemaCache[JSON.stringify(options)] = schema;
  return schema;
}

function initSchema(schema: any) {
  if (typeof schema === "string") {
    return buildSchema(schema);
  }
  const unpackedSchemaJson = schema.data ? schema.data : schema;
  if (!unpackedSchemaJson.__schema) {
    throw new Error("Please pass a valid GraphQL introspection query result.");
  }
  return buildClientSchema(unpackedSchemaJson);
}
