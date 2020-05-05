import fs from "fs-extra";

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
    return fs.remove(operation.filename);
  }
  return fs.outputFile(operation.filename, operation.content);
}
