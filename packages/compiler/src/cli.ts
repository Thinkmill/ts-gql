import { getGeneratedTypes } from "./get-generated-types";
import { getConfig } from "@ts-gql/config";
import { watch } from "./watch";
import { build } from "./build";

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
    build(process.cwd());
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
