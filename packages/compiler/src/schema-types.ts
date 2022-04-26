import * as fs from "./fs";
import path from "path";
import { codegen } from "./codegen-core";
import { hashString, parseTsGqlMeta } from "./utils";
import { FsOperation } from "./fs-operations";
import {
  wrapFileInIntegrityComment,
  getDoesFileHaveIntegrity,
} from "./integrity";
import { Config } from "@ts-gql/config";
import { lazyRequire } from "lazy-require.macro";
import { GraphQLError } from "graphql/error/GraphQLError";
import { CompilerError } from "./types";
import { BatchGraphQLError } from "@ts-gql/config";

export class ThrowableCompilerErrorSet extends Error {
  compilerErrors: CompilerError[];
  constructor(compilerErrors: CompilerError[]) {
    super(
      "A ts-gql compiler error occurred. If you're seeing this, there's likely a bug in ts-gql's error printing"
    );
    this.compilerErrors = compilerErrors;
  }
}

function generateSchemaTypes(
  config: Config,
  filename: string,
  schemaHash: string
): FsOperation {
  try {
    config.schema();
  } catch (err) {
    if (err instanceof BatchGraphQLError) {
      throw new ThrowableCompilerErrorSet(
        err.errors.map((err) => ({
          filename: config.schemaFilename,
          message: err.message,
          loc: err.locations?.[0] ? { start: err.locations[0] } : undefined,
        }))
      );
    }
    if (err instanceof GraphQLError) {
      throw new ThrowableCompilerErrorSet([
        {
          filename: config.schemaFilename,
          message: err.message,
          loc: err.locations?.[0] ? { start: err.locations[0] } : undefined,
        },
      ]);
    }
    throw new ThrowableCompilerErrorSet([
      {
        filename: config.schemaFilename,
        message: err.toString(),
      },
    ]);
  }
  let result = codegen({
    documents: [],
    schemaAst: config.schema(),
    config: {},
    filename: "",
    plugins: [
      {
        typescript: {
          enumsAsTypes: true,
          scalars: config.scalars,
          immutableTypes: config.readonlyTypes,
          nonOptionalTypename: true,
          namingConvention: "keep",
          avoidOptionals: {
            field: true,
            inputValue: false,
            object: false,
            defaultValue: false,
          },
        },
      },
    ],
    pluginMap: {
      typescript: lazyRequire<typeof import("@graphql-codegen/typescript")>(),
    },
  });

  return {
    type: "output",
    filename,
    content: wrapFileInIntegrityComment(
      `/*\nts-gql-meta-begin\n${JSON.stringify(
        { hash: schemaHash },
        null,
        2
      )}\nts-gql-meta-end\n*/\n${result}\nexport interface TSGQLDocuments extends Record<string, import('@ts-gql/tag').TypedDocumentNode<import('@ts-gql/tag').BaseDocumentTypes>> {}\n\nexport type TSGQLRequiredFragments<T> = (providedFragments: T) => T;`
    ),
  };
}

export async function cachedGenerateSchemaTypes(config: Config) {
  let schemaHash = hashString(
    config.schemaHash +
      JSON.stringify(config.scalars) +
      config.readonlyTypes +
      lazyRequire<typeof import("@graphql-codegen/typescript/package.json")>()
        .version +
      "v2"
  );
  let types: string;
  let filename = path.join(
    config.directory,
    "__generated__",
    "ts-gql",
    "@schema.d.ts"
  );
  try {
    types = await fs.readFile(filename, "utf8");
  } catch (err) {
    if (err.code === "ENOENT") {
      return generateSchemaTypes(config, filename, schemaHash);
    }
    throw err;
  }
  if (
    !getDoesFileHaveIntegrity(types) ||
    parseTsGqlMeta(types).hash !== schemaHash
  ) {
    return generateSchemaTypes(config, filename, schemaHash);
  }
}
