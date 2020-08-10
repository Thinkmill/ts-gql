import * as fs from "./fs";

export type FsOperation =
  | {
      type: "output";
      filename: string;
      content: string;
    }
  | {
      type: "remove";
      filename: string;
    };

export async function applyFsOperation(operation: FsOperation) {
  if (operation.type === "remove") {
    return fs.unlink(operation.filename);
  }
  return fs.writeFile(operation.filename, operation.content);
}
