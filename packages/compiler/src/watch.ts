import * as fs from "./fs";
import { getRawConfig, parseSchema } from "@ts-gql/config";
import { createWatcher } from "./watcher";
import { getGeneratedTypes } from "./get-generated-types";
import { applyFsOperation } from "./fs-operations";
import { lazyRequire } from "lazy-require.macro";

// TODO: handle changes incrementally
export const watch = async (cwd: string) => {
  // we're requiring these here because we lazily require them in the code that generates the types
  // which is what we want so builds that don't have to regenerate files are fast
  // but for watch, a slightly slower start up is better than a slightly slower first build which requires type generation
  require("@graphql-codegen/typescript");
  require("@graphql-codegen/typescript-operations");
  require("@babel/code-frame");
  require("graphql/validation");

  // not gonna respond to changes in the config because that would be a big peformance cost for practically no gain
  let rawConfig = await getRawConfig(cwd);

  // we want to lazily require this so it doesn't add cost to doing a regular build
  const chokidar = lazyRequire<typeof import("chokidar")>();

  let getNext = createWatcher(
    chokidar.watch(["**/*.{ts,tsx}", rawConfig.schemaFilename], {
      cwd: rawConfig.directory,
      ignored: ["**/node_modules/**"],
    })
  );

  let lastPrintedErrors: string[] | undefined;
  let shouldPrintStartMessage = true;
  while (true) {
    await getNext();

    if (shouldPrintStartMessage) {
      console.log("Started ts-gql watch");
      console.log(
        "══════════════════════════════════════════════════════════════════════════"
      );
      shouldPrintStartMessage = false;
    }

    let config = {
      ...rawConfig,
      ...parseSchema(
        rawConfig.schemaFilename,
        await fs.readFile(rawConfig.schemaFilename, "utf8")
      ),
    };
    // we want to eagerly parse the schema so that the first change that someone makes
    // to a fragment/operation happens quickly
    // we're ignoring errors here though because they're handled in getGeneratedTypes
    try {
      config.schema();
    } catch (err) {}
    let { fsOperations, errors } = await getGeneratedTypes(config);
    await Promise.all(fsOperations.map(applyFsOperation));
    let willPrintErrors =
      errors.length &&
      (lastPrintedErrors === undefined ||
        lastPrintedErrors.length !== errors.length ||
        errors.some((x, i) => lastPrintedErrors![i] !== x));
    if (fsOperations.length) {
      console.error(
        `Updated ${fsOperations.length} file${
          fsOperations.length === 1 ? "" : "s"
        }`
      );
    }

    if (willPrintErrors) {
      for (let error of errors) {
        console.error(error);
      }
    }
    lastPrintedErrors = errors;
    if (willPrintErrors || fsOperations.length)
      console.log(
        "══════════════════════════════════════════════════════════════════════════"
      );
  }
};
