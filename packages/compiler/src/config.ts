import path from "path";
import { findPkgJsonFieldUp } from "find-pkg-json-field-up";
import { getSchemaFromOptions } from "./get-schema";

export async function getRawConfig(cwd: string) {
  let { packageJson, directory } = await findPkgJsonFieldUp("ts-gql", cwd);
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
  throw new Error("Config not found");
}

export async function getConfig(cwd: string) {
  let config = await getRawConfig(cwd);
  return {
    directory: config.directory,
    schema: await getSchemaFromOptions(config.schema),
  };
}
