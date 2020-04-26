import crypto from "crypto";

export function hashString(input: string) {
  let md5sum = crypto.createHash("md5");
  md5sum.update(input);
  return md5sum.digest("hex");
}

export function parseTsGqlMeta(content: string) {
  let result = /ts-gql-meta-begin([^]+)ts-gql-meta-end/m.exec(content);
  if (result === null) {
    throw new Error(
      "could not find ts-gql meta in the following contents:\n" + content
    );
  }
  return JSON.parse(result[1]);
}
