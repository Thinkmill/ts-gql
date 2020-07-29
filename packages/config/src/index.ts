import path from "path";
import { GraphQLSchema } from "graphql";
import {
  findPkgJsonFieldUp,
  findPkgJsonFieldUpSync,
} from "find-pkg-json-field-up";
import fs from "fs";
import { promisify } from "util";
import { parseSchema, hashSchema } from "./read-schema";

export { parseSchema, hashSchema };

export class ConfigNotFoundError extends Error {}

export type Config = {
  directory: string;
  schema: GraphQLSchema;
  scalars: Record<string, string>;
  addTypename: boolean;
  readonlyTypes: boolean;
  schemaHash: string;
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

const readFile = promisify(fs.readFile);

export async function getConfig(cwd: string): Promise<Config> {
  let config = await getRawConfig(cwd);
  let schemaContents = await readFile(config.schema, "utf8");
  return {
    ...config,
    schemaHash: hashSchema(schemaContents),
    schema: parseSchema(config.schema, schemaContents),
  };
}

export function getConfigSync(cwd: string): Config {
  let config = getRawConfigSync(cwd);
  let schemaContents = fs.readFileSync(config.schema, "utf8");
  return {
    ...config,
    schemaHash: hashSchema(schemaContents),
    schema: parseSchema(config.schema, schemaContents),
  };
}
