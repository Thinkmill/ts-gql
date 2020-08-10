import * as fs from "./fs";
import type { DocumentNode } from "graphql";
import { GraphQLError } from "graphql/error/GraphQLError";
import { parse } from "graphql/language/parser";
import { extractGraphQLDocumentsContentsFromFile } from "./extract-documents";
import {
  CompilerError,
  FullSourceLocation,
  TSGQLDocument,
  NamedOperationDefinitionNode,
  NamedFragmentDefinitionNode,
} from "./types";
import babelParserPkgJson from "@babel/parser/package.json";
import { integrity, hashString, locFromSourceAndGraphQLError } from "./utils";

type DocumentExtractionCache = {
  [filename: string]: {
    hash: string;
    errors: CompilerError[];
    documents: {
      loc: FullSourceLocation;
      document: string;
    }[];
  };
};

let documentExtractionCacheVersion =
  "ts-gql-document-extractor@v1," +
  "@babel/parser@" +
  babelParserPkgJson.version;
async function readDocumentExtractionCache(cacheFilename: string) {
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
    cache: DocumentExtractionCache;
  } = JSON.parse(cacheContents);
  if (parsed.version !== documentExtractionCacheVersion) {
    return {};
  }
  return parsed.cache;
}
function writeDocumentExtractionCache(
  cacheFilename: string,
  cache: DocumentExtractionCache
) {
  let stringified = JSON.stringify(
    {
      version: documentExtractionCacheVersion,
      integrity: integrity.placeholder,
      cache,
    },
    null,
    2
  );
  let signed = integrity.sign(stringified);
  return fs.writeFile(cacheFilename, signed);
}

export async function getDocuments(files: string[], cacheFilename: string) {
  let allErrors: CompilerError[] = [];
  let allDocuments: TSGQLDocument[] = [];
  let cache = await readDocumentExtractionCache(cacheFilename);
  let newCache: DocumentExtractionCache = {};
  await Promise.all(
    files.map(async (filename) => {
      let contents = await fs.readFile(filename, "utf8");
      let hash = hashString(contents);
      if (cache[filename]?.hash !== hash) {
        cache[filename] = {
          hash,
          ...extractGraphQLDocumentsContentsFromFile(filename, contents),
        };
      }
      newCache[filename] = cache[filename];
      const { documents, errors } = cache[filename];
      allErrors.push(...errors);

      documents.forEach((document) => {
        try {
          let ast = parse(document.document);
          allDocuments.push({
            node: getGqlNode(ast),
            loc: document.loc,
            filename,
          });
        } catch (err) {
          if (err instanceof GraphQLError) {
            allErrors.push({
              filename,
              message: err.message,
              loc: locFromSourceAndGraphQLError(document.loc, err),
            });
          } else {
            allErrors.push({
              filename,
              message: err.message,
              loc: document.loc,
            });
          }
        }
      });
    })
  );
  await writeDocumentExtractionCache(cacheFilename, newCache);
  return { errors: allErrors, documents: allDocuments };
}

function getGqlNode(ast: DocumentNode) {
  if (ast.definitions.length !== 1) {
    throw new GraphQLError(
      "GraphQL documents must only have a single operation or fragment definition",
      [ast.definitions[1]]
    );
  }
  let [firstNode] = ast.definitions;

  if (
    firstNode.kind !== "FragmentDefinition" &&
    firstNode.kind !== "OperationDefinition"
  ) {
    throw new GraphQLError(
      "Only fragments and operations are allowed",
      firstNode
    );
  }

  if (!firstNode.name) {
    throw new GraphQLError("Operations must have names", firstNode);
  }
  return firstNode as
    | NamedOperationDefinitionNode
    | NamedFragmentDefinitionNode;
}
