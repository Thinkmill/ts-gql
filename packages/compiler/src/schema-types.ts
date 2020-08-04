import fs from "fs-extra";
import path from "path";
import { codegen } from "./codegen-core";
import { hashString, parseTsGqlMeta } from "./utils";
import { FsOperation } from "./fs-operations";
import {
  wrapFileInIntegrityComment,
  getDoesFileHaveIntegrity,
} from "./integrity";
import { Config } from "@ts-gql/config";

function generateSchemaTypes(
  config: Config,
  filename: string,
  schemaHash: string
): FsOperation {
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
          avoidOptionals: {
            object: true,
            inputValue: false,
            field: true,
          },
          immutableTypes: config.readonlyTypes,
          nonOptionalTypename: true,
          namingConvention: "keep",
        },
      },
    ],
    pluginMap: { typescript: require("@graphql-codegen/typescript") },
  });

  return {
    type: "output",
    filename,
    content: wrapFileInIntegrityComment(
      `/*\nts-gql-meta-begin\n${JSON.stringify(
        { hash: schemaHash },
        null,
        2
      )}\nts-gql-meta-end\n*/\n${result}\nexport interface TSGQLDocuments extends Record<string, import('@ts-gql/tag').TypedDocumentNode<import('@ts-gql/tag').BaseDocumentTypes>> {}`
    ),
  };
}

export async function cachedGenerateSchemaTypes(config: Config) {
  let schemaHash = hashString(
    config.schemaHash + JSON.stringify(config.scalars) + config.readonlyTypes
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
