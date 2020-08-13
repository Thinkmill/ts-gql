import * as fs from "./fs";
import nodePath from "path";
import type { FragmentDefinitionNode } from "graphql";
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

const walk = promisify(_walk);

function getPrintCompilerError() {
  let readFile = memoize((filename: string) => fs.readFile(filename, "utf8"));
  return async (error: CompilerError) => {
    const { codeFrameColumns } = lazyRequire<
      typeof import("@babel/code-frame")
    >();
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
  };
}

type Dependencies = string | Dependencies[];

let tsExtensionRegex = /\.tsx?$/;

let dtsExtensionRegex = /\.d\.ts$/;

const walkSettings = new Settings({
  deepFilter: (entry) =>
    !entry.path.includes("node_modules") &&
    entry.path !== `__generated__${nodePath.sep}ts-gql`,
  entryFilter: (entry) =>
    tsExtensionRegex.test(entry.name) && !dtsExtensionRegex.test(entry.name),
});

export const getGeneratedTypes = async (config: Config) => {
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
  await Promise.all(
    Object.keys(uniqueDocumentsByName).map(async (key) => {
      const documentInfo = uniqueDocumentsByName[key];
      let nodes = [...new Set(dependencies[key].flat(Infinity))].map(
        (x) => uniqueDocumentsByName[x].node as FragmentDefinitionNode
      );

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
  return dependencies;
}
