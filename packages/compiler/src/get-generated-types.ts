import fs from "fs-extra";
import nodePath from "path";
import type { FragmentDefinitionNode } from "graphql";
import { GraphQLError } from "graphql/error/GraphQLError";
import { visit } from "graphql/language/visitor";
import slash from "slash";
import globby from "globby";
import { cachedGenerateSchemaTypes } from "./schema-types";
import {
  cachedGenerateOperationTypes,
  cachedGenerateErrorModuleFsOperation,
} from "./operation-types";
import { FsOperation } from "./fs-operations";
import { Config } from "@ts-gql/config";
import { CompilerError, TSGQLDocument } from "./types";
import { cachedGenerateIntrospectionResult } from "./introspection-result";
import { locFromSourceAndGraphQLError, hashString } from "./utils";
import { getDocuments } from "./get-documents";
import {
  validateDocument,
  readDocumentValidationCache,
  writeDocumentValidationCache,
  DocumentValidationCache,
} from "./validate-documents";

function memoize<V>(fn: (arg: string) => V): (arg: string) => V {
  const cache: { [key: string]: V } = {};
  return (arg: string) => {
    if (cache[arg] === undefined) cache[arg] = fn(arg);
    return cache[arg];
  };
}

function getPrintCompilerError() {
  let readFile = memoize((filename: string) => fs.readFile(filename, "utf8"));
  return async (error: CompilerError) => {
    const {
      codeFrameColumns,
    } = require("@babel/code-frame") as typeof import("@babel/code-frame");
    let content = await readFile(error.filename);
    return (
      error.filename +
      "\n" +
      (error.loc
        ? codeFrameColumns(content, error.loc, {
            message: error.message,
            highlightCode: true,
          })
        : error.message)
    );
  };
}

export const getGeneratedTypes = async (config: Config) => {
  let generatedDirectory = nodePath.join(
    config.directory,
    "__generated__",
    "ts-gql"
  );

  const files = (
    await globby(["**/*.{ts,tsx}"], {
      cwd: config.directory,
      absolute: true,
      expandDirectories: false,
      ignore: ["**/node_modules/**", "__generated__/ts-gql/*", "**/*.d.ts"],
    })
  ).map((x) => slash(x));

  let { errors, documents } = await getDocuments(
    files,
    nodePath.join(generatedDirectory, "@document-cache.json")
  );

  let allDocumentsByName: Record<string, TSGQLDocument[]> = {};

  for (let document of documents) {
    let name = document.node.name.value;
    if (!allDocumentsByName[name]) {
      allDocumentsByName[name] = [];
    }
    allDocumentsByName[name].push(document);
  }
  let uniqueDocumentsByName: Record<string, TSGQLDocument> = {};
  let printCompilerError = getPrintCompilerError();
  let fsOperations: FsOperation[] = [];

  await Promise.all(
    Object.keys(allDocumentsByName).map(async (name) => {
      if (allDocumentsByName[name].length !== 1) {
        let nonUniqueNameErrors = allDocumentsByName[name].map((document) => {
          return {
            filename: document.filename,
            loc: locFromSourceAndGraphQLError(
              document.loc,
              new GraphQLError("", document.node.name)
            ),
            message: `Multiple ${
              document.node.kind === "FragmentDefinition"
                ? "fragments"
                : "operations"
            } exist with the name ${document.node.name.value}`,
          };
        });
        errors.push(...nonUniqueNameErrors);

        let operation = await cachedGenerateErrorModuleFsOperation(
          nodePath.join(generatedDirectory, `${name}.ts`),
          `There ${
            nonUniqueNameErrors.length === 1 ? "is an error" : "are errors"
          } with ${name}\n${(
            await Promise.all(errors.map((x) => printCompilerError(x)))
          ).join("\n")}`
        );
        if (operation) {
          fsOperations.push(operation);
        }
      } else {
        uniqueDocumentsByName[allDocumentsByName[name][0].node.name.value] =
          allDocumentsByName[name][0];
      }
    })
  );

  try {
    let generatedDirectoryFiles = (await fs.readdir(generatedDirectory))
      .filter((x) => !x.startsWith("@"))
      .map((x) => x.replace(/\.ts$/, ""));

    for (let name of generatedDirectoryFiles) {
      if (allDocumentsByName[name] === undefined) {
        fsOperations.push({
          type: "remove",
          filename: nodePath.join(generatedDirectory, name + ".ts"),
        });
      }
    }
  } catch (err) {
    if (err.code !== "ENOENT") {
      throw err;
    }
  }

  let schemaOperation = await cachedGenerateSchemaTypes(config);

  if (schemaOperation) {
    fsOperations.push(schemaOperation);
  }

  let operation = await cachedGenerateIntrospectionResult(
    config,
    nodePath.join(generatedDirectory, "@introspection.ts")
  );

  if (operation) {
    fsOperations.push(operation);
  }

  let dependencies = Object.keys(uniqueDocumentsByName).reduce((obj, item) => {
    obj[item] = [];
    return obj;
  }, {} as Record<string, string[]>);

  for (let key in uniqueDocumentsByName) {
    let { node } = uniqueDocumentsByName[key];
    visit(node, {
      FragmentSpread(node) {
        let name = node.name.value;
        if (
          !uniqueDocumentsByName[name] ||
          uniqueDocumentsByName[name].node.kind === "OperationDefinition"
        ) {
          errors.push({
            message: `Fragment ${name} not found`,
            filename: uniqueDocumentsByName[key].filename,
            loc: locFromSourceAndGraphQLError(
              uniqueDocumentsByName[key].loc,
              new GraphQLError("Fragment", [node])
            ),
          });
        } else {
          dependencies[key].push(name);
        }
      },
    });
  }

  const documentValidationCache = await readDocumentValidationCache(config);
  const newDocumentValidationCache: DocumentValidationCache = {};
  await Promise.all(
    Object.keys(uniqueDocumentsByName).map(async (key) => {
      const documentInfo = uniqueDocumentsByName[key];
      let nodes = [
        documentInfo.node,
        ...getFlatDependenciesForItem(dependencies, key).map(
          (x) => uniqueDocumentsByName[x].node as FragmentDefinitionNode
        ),
      ];

      let document = {
        kind: "Document",
        definitions: nodes,
      } as const;
      let operationHash = hashString(
        config.schemaHash +
          JSON.stringify(document) +
          config.addTypename +
          "v9" +
          config.readonlyTypes
      );

      if (documentValidationCache[operationHash] === undefined) {
        documentValidationCache[operationHash] = validateDocument(
          document,
          documentInfo.filename,
          config,
          documentInfo.loc
        );
      }
      newDocumentValidationCache[operationHash] =
        documentValidationCache[operationHash];
      const gqlErrors = documentValidationCache[operationHash];
      errors.push(...gqlErrors);

      let filename = nodePath.join(
        generatedDirectory,
        `${nodes[0].name.value}.ts`
      );
      let operation = gqlErrors.length
        ? await cachedGenerateErrorModuleFsOperation(
            filename,
            `${documentInfo.filename}\nThere ${
              gqlErrors.length === 1 ? "is an error" : "are errors"
            } with ${nodes[0].name.value}\n${(
              await Promise.all(errors.map((x) => printCompilerError(x)))
            ).join("\n")}`
          )
        : await cachedGenerateOperationTypes(
            config,
            document,
            filename,
            operationHash
          );
      if (operation) fsOperations.push(operation);
    })
  );
  await writeDocumentValidationCache(config, newDocumentValidationCache);
  return {
    fsOperations,
    errors: await Promise.all(errors.map((x) => printCompilerError(x))),
  };
};

function getFlatDependenciesForItem(
  deps: Record<string, string[]>,
  item: string
): string[] {
  return [
    ...new Set<string>(
      deps[item].concat(
        ...deps[item].map((item) => getFlatDependenciesForItem(deps, item))
      )
    ),
  ];
}
