import { hashString } from "./utils";

export function getDoesFileHaveIntegrity(content: string) {
  let hash: string | undefined;
  content = content.replace(
    /^\/\/ ts-gql-integrity:([a-f0-9]{32})\n/,
    (match, md5) => {
      hash = md5;
      return "";
    }
  );
  if (!hash) {
    return false;
  }
  return hash === hashString(content);
}

export function wrapFileInIntegrityComment(content: string) {
  return `// ts-gql-integrity:${hashString(content)}\n${content}`;
}
