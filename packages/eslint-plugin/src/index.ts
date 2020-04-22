import { ESLintUtils } from "@typescript-eslint/experimental-utils";
import { codegen } from "./codegen-core";
import * as typescriptPlugin from "@graphql-codegen/typescript";
import fs from "fs-extra";
import crypto from "crypto";
import path from "path";

import { print, printSchema, GraphQLSchema, parse } from "graphql";
import { handleTemplateTag } from "./parse";
import { getSchemaFromOptions } from "./get-schema";

let createRule = ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/Thinkmill/ts-gql/blob/master/packages/eslint-plugin/docs/rules/${name}.md`
);

let messages = {
  fragmentInterpolationMustBeOutsideBrackets:
    "Invalid interpolation - fragment interpolation must occur outside of the brackets.",
  invalidFragmentOrVariable:
    "Invalid interpolation - not a valid fragment or variable.",
  singleOperation: "GraphQL documents must have only one operation",
};

function hashString(input: string) {
  let md5sum = crypto.createHash("md5");
  md5sum.update(input);
  return md5sum.digest("hex");
}

function parseTsGqlMeta(content: string) {
  let result = /ts-gql-meta-begin([^]+)ts-gql-meta-end/m.exec(content);
  if (result === null) {
    throw new Error("could not find ts-gql meta");
  }
  return JSON.parse(result[1]);
}

export type MessageId = keyof typeof messages;

function writeSchemaTypes(
  schema: GraphQLSchema,
  filename: string,
  schemaHash: string
) {
  let result = codegen({
    documents: [],
    schema: parse(printSchema(schema)),
    schemaAst: schema,
    config: {},
    filename: "",
    plugins: [
      {
        typescript: {},
      },
    ],
    pluginMap: { typescript: typescriptPlugin },
  });
  fs.outputFileSync(filename, result);
}

function ensureSchemaTypesAreWritten(schema: GraphQLSchema, filename: string) {
  let printedSchema = printSchema(schema);
  let schemaHash = hashString(printedSchema);
  let types: string;
  try {
    types = fs.readFileSync(filename, "utf8");
  } catch (err) {
    if (err.code === "ENOENT") {
      return writeSchemaTypes(schema, filename, schemaHash);
    }
    throw err;
  }
  let meta = parseTsGqlMeta(types);
  if (meta.hash !== schemaHash) {
    writeSchemaTypes(schema, filename, schemaHash);
  }
}

export const rules = {
  "ts-gql": createRule<
    [{ schemaFilename?: string; schema?: any; generatedDirectory: string }],
    MessageId
  >({
    name: "ts-gql",
    meta: {
      fixable: "code",
      docs: {
        requiresTypeChecking: true,
        category: "Best Practices",
        recommended: "error",
        description: "",
      },
      messages,
      type: "problem",
      schema: [
        {
          type: "object",
          required: true,
          properties: {
            schemaFilename: { type: "string" },
            schema: { type: "any" },
            generatedDirectory: { type: "string", required: true },
          },
        },
      ],
    },
    defaultOptions: [
      {
        generatedDirectory: path.join(process.cwd(), "__generated__", "ts-gql"),
      },
    ],
    create(context) {
      return {
        TaggedTemplateExpression(node) {
          // TODO: check import
          // idea: instead of checking the import, check the _type_
          // so people could re-export the tag if they want to and everything would still _just work_
          if (node.tag.type === "Identifier" && node.tag.name === "gql") {
            let schema = getSchemaFromOptions(context.options[0]);
            ensureSchemaTypesAreWritten(
              schema,
              path.join(context.options[0].generatedDirectory, "@types.d.ts")
            );
            let ast = handleTemplateTag(node, context, schema, "apollo");
            if (ast) {
              let filteredDefinitions = ast.definitions.filter(
                (x) => x.kind === "OperationDefinition"
              );
              if (filteredDefinitions.length !== 1) {
                context.report({
                  messageId: "singleOperation",
                  node,
                });
              }
            }
          }
        },
      };
    },
  }),
};
