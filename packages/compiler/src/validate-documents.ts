import {
  specifiedRules,
  NoUnusedFragmentsRule,
  GraphQLError,
  validate,
  ValidationRule,
  DocumentNode,
} from "graphql";
import nodePath from "path";
import * as fs from "fs-extra";
import { Config } from "@ts-gql/config";
import { locFromSourceAndGraphQLError, integrity } from "./utils";
import { CompilerError, FullSourceLocation } from "./types";

const SkipNonFirstFragmentsRule: ValidationRule = () => {
  return {
    FragmentDefinition(node, key) {
      if (key !== 0) {
        return null;
      }
    },
  };
};

const FragmentNameValidationRule: ValidationRule = (context) => {
  return {
    FragmentDefinition(node) {
      let message =
        "Fragment names must be in the format ComponentName_propName";

      if (!node.name) {
        context.reportError(new GraphQLError(message, [node]));
      } else if (!/.+_.+/.test(node.name.value)) {
        context.reportError(new GraphQLError(message, [node.name]));
      }
    },
  };
};

let fragmentDocumentRules = [
  SkipNonFirstFragmentsRule,
  FragmentNameValidationRule,
].concat(specifiedRules.filter((x) => x !== NoUnusedFragmentsRule));

let operationDocumentRules = [SkipNonFirstFragmentsRule].concat(specifiedRules);

export type DocumentValidationCache = {
  [operationHash: string]: CompilerError[];
};

let getDocumentValidationCacheVersion = (config: Config) =>
  "ts-gql-document-validator@v1,schema@" + config.schemaHash;

export async function readDocumentValidationCache(config: Config) {
  let cacheFilename = nodePath.join(
    config.directory,
    "__generated__",
    "ts-gql",
    "@validation-cache.json"
  );
  let cacheContents: string;
  try {
    cacheContents = await fs.readFile(cacheFilename, "utf8");
  } catch (err) {
    if (err.code === "ENOENT") {
      return {};
    }
    throw err;
  }
  if (!integrity.verify(cacheContents)) {
    return {};
  }
  let parsed: {
    version: string;
    integrity: string;
    cache: DocumentValidationCache;
  } = JSON.parse(cacheContents);
  if (parsed.version !== getDocumentValidationCacheVersion(config)) {
    return {};
  }
  return parsed.cache;
}

export function writeDocumentValidationCache(
  config: Config,
  cache: DocumentValidationCache
) {
  let cacheFilename = nodePath.join(
    config.directory,
    "__generated__",
    "ts-gql",
    "@validation-cache.json"
  );
  let stringified = JSON.stringify(
    {
      version: getDocumentValidationCacheVersion(config),
      integrity: integrity.placeholder,
      cache,
    },
    null,
    2
  );
  let signed = integrity.sign(stringified);
  return fs.outputFile(cacheFilename, signed);
}

export function validateDocument(
  document: DocumentNode,
  filename: string,
  config: Config,
  loc: FullSourceLocation
) {
  console.log("validate");
  return validate(
    config.schema,
    document,
    document.definitions[0].kind === "OperationDefinition"
      ? operationDocumentRules
      : fragmentDocumentRules
  ).map((err) => ({
    filename,
    message: err.message,
    loc: locFromSourceAndGraphQLError(loc, err),
  }));
}
