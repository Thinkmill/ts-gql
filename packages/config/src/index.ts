import path from "path";
import { GraphQLSchema } from "graphql/type/schema";
import {
  findPkgJsonFieldUp,
  findPkgJsonFieldUpSync,
} from "find-pkg-json-field-up";
import fs from "fs";
import { promisify } from "util";
import { parseSchema, BatchGraphQLError } from "./parse-schema";

export { parseSchema, BatchGraphQLError };

export class ConfigNotFoundError extends Error {}

export type Config = {
  schema: () => GraphQLSchema;
  schemaHash: string;
} & RawConfig;

export type RawConfig = {
  directory: string;
  schemaFilename: string;
  scalars: Record<string, string>;
  addTypename: boolean;
  readonlyTypes: boolean;
  mode: "babel" | "no-babel" | "babel-allow-no-babel";
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
      schemaFilename: path.resolve(directory, field.schema),
      directory,
      scalars: field.scalars || {},
      addTypename: field.addTypename ?? true,
      readonlyTypes: field.readonlyTypes ?? true,
      mode: field.mode ?? "babel",
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
  let schemaContents = await readFile(config.schemaFilename, "utf8");
  return {
    ...config,
    ...parseSchema(config.schemaFilename, schemaContents),
  };
}

export function getConfigSync(cwd: string): Config {
  let config = getRawConfigSync(cwd);
  let schemaContents = fs.readFileSync(config.schemaFilename, "utf8");
  return {
    ...config,
    ...parseSchema(config.schemaFilename, schemaContents),
  };
}
