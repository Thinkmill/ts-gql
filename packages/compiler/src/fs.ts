import gracefulFS from "graceful-fs";
import { promisify } from "util";

export const writeFile = promisify(gracefulFS.writeFile);
export const readFile = promisify(gracefulFS.readFile);
export const mkdir = promisify(gracefulFS.mkdir);
export const readdir = promisify(gracefulFS.readdir);
export const unlink = promisify(gracefulFS.unlink);
