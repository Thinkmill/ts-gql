import * as fs from "fs-extra";
import { getRawConfig } from "@ts-gql/config";
import { createWatcher } from "./watcher";
import { getGeneratedTypes } from "./get-generated-types";
import { parseSchema } from "@ts-gql/config";
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
    chokidar.watch(["**/*.{ts,tsx}", rawConfig.schema], {
      cwd: rawConfig.directory,
      ignored: ["**/node_modules/**"],
    })
  );

  while (true) {
    await getNext();
    let config = {
      ...rawConfig,
      ...parseSchema(
        rawConfig.schema,
        await fs.readFile(rawConfig.schema, "utf8")
      ),
    };
    // we want to eagerly parse the schema so that the first change that someone makes
    // to a fragment/operation happens quickly
    config.schema();
    let { fsOperations, errors } = await getGeneratedTypes(config);
    await Promise.all(
      fsOperations.map(async (operation) => {
        await applyFsOperation(operation);
        if (operation.type === "output") {
          console.log(`updated ${operation.filename}`);
        } else {
          console.log(`removed ${operation.filename}`);
        }
      })
    );
    if (errors.length) {
      for (let error of errors) {
        console.error(error);
      }
    }
  }
};
