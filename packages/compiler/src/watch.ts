import chokidar from "chokidar";
import { getRawConfig } from "./config";
import { createWatcher } from "./watcher";
import { getGeneratedTypes } from "../dist/compiler.cjs";
import { getSchemaFromOptions } from "./get-schema";
import { applyFsOperation } from "./fs-operations";

// TODO: handle changes incrementally
export const watch = async (cwd: string) => {
  // not gonna respond to changes in the config because that would be a big peformance cost for practically no gain
  let rawConfig = await getRawConfig(cwd);

  let getNext = createWatcher(
    chokidar.watch(["**/*.{ts,tsx}"], {
      cwd: rawConfig.directory,
      ignored: ["**/node_modules/**"],
    })
  );

  while (true) {
    await getNext();
    let { fsOperations, errors } = await getGeneratedTypes({
      schema: await getSchemaFromOptions(rawConfig.schema),
      directory: rawConfig.directory,
    });
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
