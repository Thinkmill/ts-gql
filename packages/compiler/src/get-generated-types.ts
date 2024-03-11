import * as fs from "./fs";
import nodePath from "path";
import { GraphQLError } from "graphql/error/GraphQLError";
import { visit } from "graphql/language/visitor";
import { lazyRequire } from "lazy-require.macro";
import slash from "slash";
import { walk as _walk, Settings } from "@nodelib/fs.walk";
import {
  cachedGenerateSchemaTypes,
  ThrowableCompilerErrorSet,
} from "./schema-types";
import {
  cachedGenerateOperationTypes,
  cachedGenerateErrorModuleFsOperation,
} from "./operation-types";
import { FsOperation } from "./fs-operations";
import { Config } from "@ts-gql/config";
import { promisify } from "util";
import { CompilerError, TSGQLDocument } from "./types";
import { cachedGenerateIntrospectionResult } from "./introspection-result";
import { locFromSourceAndGraphQLError, hashString, resolvable } from "./utils";
import { getDocuments } from "./get-documents";
import {
  validateDocument,
  readDocumentValidationCache,
  writeDocumentValidationCache,
  DocumentValidationCache,
} from "./validate-documents";
import { DocumentNode } from "graphql";
import { weakMemoize } from "./weakMemoize";

function memoize<V>(fn: (arg: string) => V): (arg: string) => V {
  const cache: { [key: string]: V } = {};
  return (arg: string) => {
    if (cache[arg] === undefined) cache[arg] = fn(arg);
    return cache[arg];
  };
}

const walk = promisify(_walk);

function getPrintCompilerError() {
  let readFile = memoize((filename: string) => fs.readFile(filename, "utf8"));

  return weakMemoize(async (error: CompilerError) => {
    const { codeFrameColumns } =
      lazyRequire<typeof import("@babel/code-frame")>();
    let content = await readFile(error.filename);
    return (
      error.filename +
      (error.loc
        ? ":" + error.loc.start.line + ":" + error.loc.start.column
        : "") +
      "\n" +
      (error.loc
        ? codeFrameColumns(content, error.loc, {
            message: error.message,
            highlightCode: true,
          })
        : error.message)
    );
  });
}

let tsExtensionRegex = /\.tsx?$/;

let dtsExtensionRegex = /\.d\.ts$/;

const walkSettings = new Settings({
  deepFilter: (entry) =>
    !entry.path.includes("node_modules") &&
    entry.path !== `__generated__${nodePath.sep}ts-gql`,
  entryFilter: (entry) =>
    entry.dirent.isFile() &&
    tsExtensionRegex.test(entry.name) &&
    !dtsExtensionRegex.test(entry.name),
});

export const getGeneratedTypes = async (
  config: Config,
  deleteInvalidFiles: boolean
) => {
  let generatedDirectory = nodePath.join(
    config.directory,
    "__generated__",
    "ts-gql"
  );

  const files = (
    await Promise.all([
      walk(config.directory, walkSettings),
      fs.mkdir(generatedDirectory, { recursive: true }),
    ])
  )[0].map((x) => slash(x.path));

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

  if (deleteInvalidFiles) {
    try {
      let generatedDirectoryFiles = (
        await fs.readdir(generatedDirectory)
      ).filter((x) => !x.startsWith("@"));

      for (let name of generatedDirectoryFiles) {
        if (allDocumentsByName[name.replace(/\.ts$/, "")] === undefined) {
          fsOperations.push({
            type: "remove",
            filename: nodePath.join(generatedDirectory, name),
          });
        }
      }
    } catch (err) {
      if (err.code !== "ENOENT") {
        throw err;
      }
    }
  }

  try {
    let schemaOperation = await cachedGenerateSchemaTypes(config);

    if (schemaOperation) {
      fsOperations.push(schemaOperation);
    }
  } catch (err) {
    if (err instanceof ThrowableCompilerErrorSet) {
      return {
        fsOperations: [],
        errors: await Promise.all(
          err.compilerErrors.map((x) => printCompilerError(x))
        ),
      };
    }
    throw err;
  }

  let operation = await cachedGenerateIntrospectionResult(
    config,
    nodePath.join(generatedDirectory, "@introspection.ts")
  );

  if (operation) {
    fsOperations.push(operation);
  }
  const dependencies = getDependencies(uniqueDocumentsByName, errors);
  const documentValidationCache = await readDocumentValidationCache(config);
  const newDocumentValidationCache: DocumentValidationCache = {};

  const hasValidated = resolvable<void>();
  const nodeNames = Object.keys(uniqueDocumentsByName);
  let i = 0;
  let validate = () => {
    i++;
    if (i === nodeNames.length) {
      hasValidated.resolve();
    }
    return hasValidated;
  };
  const operationHashByName: Record<string, string> = {};

  await Promise.all(
    nodeNames.map(async (key) => {
      const documentInfo = uniqueDocumentsByName[key];
      let nodes = dependencies[key].map((x) => uniqueDocumentsByName[x].node);

      let document = {
        kind: "Document" as DocumentNode["kind"],
        definitions: nodes,
      } as const;
      let operationHash = hashString(
        config.schemaHash +
          JSON.stringify(document) +
          config.addTypename +
          "v13" +
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
      operationHashByName[key] = operationHash;
      const gqlErrors = documentValidationCache[operationHash];
      errors.push(...gqlErrors);
      await validate();
      let filename = nodePath.join(
        generatedDirectory,
        `${nodes[0].name.value}.ts`
      );
      const allGraphQLErrorsForDocument = new Set<CompilerError>(gqlErrors);
      for (const node of nodes) {
        const errors =
          newDocumentValidationCache[operationHashByName[node.name.value]];
        for (const error of errors) {
          allGraphQLErrorsForDocument.add(error);
        }
      }

      let operation = allGraphQLErrorsForDocument.size
        ? await cachedGenerateErrorModuleFsOperation(
            filename,
            `\n${(
              await Promise.all(
                [...allGraphQLErrorsForDocument].map((x) =>
                  printCompilerError(x)
                )
              )
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
    errors: await Promise.all(
      [...new Set(errors)].map((x) => printCompilerError(x))
    ),
  };
};

type Dependencies = string | Dependencies[];

function getDependencies(
  uniqueDocumentsByName: Record<string, TSGQLDocument>,
  errors: CompilerError[]
) {
  let dependencies: Record<string, Dependencies[]> = {};
  Object.keys(uniqueDocumentsByName).forEach((item) => {
    dependencies[item] = [item];
  });

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
          dependencies[key].push(dependencies[name]);
        }
      },
    });
  }
  return Object.fromEntries(
    Object.entries(dependencies).map(([name, deps]) => {
      return [name, [...new Set(deps.flat(Infinity as 1) as string[])]];
    })
  );
}
