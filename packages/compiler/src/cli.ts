import { getGeneratedTypes } from "./get-generated-types";
import { applyFsOperation } from "./fs-operations";
import { getConfig } from "@ts-gql/config";
import { watch } from "./watch";

let arg = process.argv[2];

let commands: Record<string, () => Promise<any>> = {
  async check() {
    let { fsOperations, errors } = await getGeneratedTypes(
      await getConfig(process.cwd())
    );
    for (let error of errors) {
      console.error(error);
    }

    for (let file of fsOperations) {
      if (file.type === "output") {
        console.error(`${file.filename} is not up to date`);
      } else {
        console.error(
          `${file.filename} should not exist because it corresponds to a GraphQL document that does not exist or is invalid`
        );
      }
    }
    if (fsOperations.length || errors.length) {
      process.exit(1);
    }
  },
  async build() {
    let { fsOperations, errors } = await getGeneratedTypes(
      await getConfig(process.cwd())
    );
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
      process.exit(1);
    }
  },
  watch: async () => {
    watch(process.cwd());
  },
};

let command = commands[arg];

if (!command) {
  console.error(
    `The command ${arg} does not exist, try one of ${Object.keys(commands).join(
      ", "
    )}`
  );
  process.exit(1);
}

command();
