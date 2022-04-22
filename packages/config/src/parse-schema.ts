import { version } from "graphql/version";
import type { GraphQLSchema } from "graphql/type/schema";
import { lazyRequire } from "lazy-require.macro";
import { parse } from "graphql/language/parser";
import { GraphQLError } from "graphql/error/GraphQLError";
import crypto from "crypto";

function hashSchema(input: string) {
  let md5sum = crypto.createHash("md5");

  md5sum.update(version);
  md5sum.update("v2");
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

export class BatchGraphQLError extends Error {
  errors: readonly GraphQLError[];
  constructor(errors: readonly GraphQLError[]) {
    super(
      "There are validation errors in your GraphQL schema. If you're seeing this, there's likely a bug in ts-gql's error printing."
    );
    this.errors = errors;
  }
}

function uncachedParseSchema(filename: string, content: string) {
  if (!filename.endsWith(".json")) {
    const ast = parse(content);
    const { validateSDL } =
      lazyRequire<typeof import("graphql/validation/validate")>();
    const validationErrors = validateSDL(ast);
    if (validationErrors.length) {
      throw new BatchGraphQLError(validationErrors);
    }
    const { buildASTSchema } =
      lazyRequire<typeof import("graphql/utilities/buildASTSchema")>();

    return buildASTSchema(ast, { assumeValidSDL: true });
  }
  const { buildClientSchema } =
    lazyRequire<typeof import("graphql/utilities/buildClientSchema")>();

  let schema = JSON.parse(content);
  const unpackedSchemaJson = schema.data ? schema.data : schema;
  if (!unpackedSchemaJson.__schema) {
    throw new Error(
      `${filename} should contain a valid introspection query result`
    );
  }
  return buildClientSchema(unpackedSchemaJson);
}
