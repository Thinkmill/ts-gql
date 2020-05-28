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
  scalars: Record<string, string>;
  addTypename: boolean;
  readonlyTypes: boolean;
};

export type RawConfig = {
  directory: string;
  schema: string;
  scalars: Record<string, string>;
  addTypename: boolean;
  readonlyTypes: boolean;
};

function parseFieldToConfig({
  packageJson,
  directory,
}: {
  packageJson: Record<string, any>;
  directory: string;
}): RawConfig {
  let field = packageJson["ts-gql"];
  if (
    typeof field === "object" &&
    field !== null &&
    typeof field.schema === "string"
  ) {
    return {
      schema: path.resolve(directory, field.schema),
      directory,
      scalars: field.scalars || {},
      addTypename: field.addTypename ?? true,
      readonlyTypes: field.readonlyTypes ?? true,
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

export async function getConfig(cwd: string): Promise<Config> {
  let config = await getRawConfig(cwd);
  return {
    ...config,
    schema: await readSchema(config.schema),
  };
}

export function getConfigSync(cwd: string): Config {
  let config = getRawConfigSync(cwd);
  return {
    ...config,
    schema: readSchemaSync(config.schema),
  };
}
