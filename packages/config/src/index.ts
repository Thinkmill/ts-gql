import path from "path";
import { GraphQLSchema } from "graphql";
import {
  findPkgJsonFieldUp,
  findPkgJsonFieldUpSync,
} from "find-pkg-json-field-up";
import { readSchema, readSchemaSync } from "./read-schema";

export { readSchema, readSchemaSync };

export class ConfigNotFoundError extends Error {}

export type Config = {
  directory: string;
  schema: GraphQLSchema;
};

export type RawConfig = {
  directory: string;
  schema: string;
};

function parseFieldToConfig({
  packageJson,
  directory,
}: {
  packageJson: Record<string, any>;
  directory: string;
}) {
  let field = packageJson["ts-gql"];
  if (
    typeof field === "object" &&
    field !== null &&
    typeof field.schema === "string"
  ) {
    return {
      schema: path.resolve(directory, field.schema),
      directory,
    };
  }
  throw new ConfigNotFoundError("ts-gql config not found");
}

export async function getRawConfig(cwd: string) {
  return parseFieldToConfig(await findPkgJsonFieldUp("ts-gql", cwd));
}

export function getRawConfigSync(cwd: string) {
  return parseFieldToConfig(findPkgJsonFieldUpSync("ts-gql", cwd));
}

export async function getConfig(cwd: string) {
  let config = await getRawConfig(cwd);
  return {
    directory: config.directory,
    schema: await readSchema(config.schema),
  };
}

export function getConfigSync(cwd: string) {
  let config = getRawConfigSync(cwd);
  return {
    directory: config.directory,
    schema: readSchemaSync(config.schema),
  };
}
