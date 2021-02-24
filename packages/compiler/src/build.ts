import { getGeneratedTypes } from "./get-generated-types";
import { getConfig } from "@ts-gql/config";
import { applyFsOperation } from "./fs-operations";

export async function build(cwd: string) {
  let { fsOperations, errors } = await getGeneratedTypes(
    await getConfig(cwd),
    true
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
}
