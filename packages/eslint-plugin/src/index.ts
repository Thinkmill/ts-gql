import { ESLintUtils } from "@typescript-eslint/experimental-utils";
import { print } from "graphql";
import { handleTemplateTag } from "./parse";
import { getSchemaFromOptions } from "./get-schema";

let createRule = ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/Thinkmill/ts-gql/blob/master/packages/eslint-plugin/docs/rules/${name}.md`
);

function isGql() {}

let messages = {
  fragmentInterpolationMustBeOutsideBrackets:
    "Invalid interpolation - fragment interpolation must occur outside of the brackets.",
  invalidFragmentOrVariable:
    "Invalid interpolation - not a valid fragment or variable.",
};

export type MessageId = keyof typeof messages;

export const rules = {
  "ts-gql": createRule<[{ schemaFilename?: string; schema?: any }], MessageId>({
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
      schema: { type: "any" },
      //   schema: {
      //     type: "object",
      //     properties: {
      //       schemaFilename: { type: "string" },
      //       schema: { type: "any" },
      //     },
      //   },
    },
    // @ts-ignore
    defaultOptions: [{}],
    create(context) {
      return {
        TaggedTemplateExpression(node) {
          // TODO: check import
          if (node.tag.type === "Identifier" && node.tag.name === "gql") {
            console.log(context.options[0]);
            let schema = getSchemaFromOptions(context.options[0]);
            let ast = handleTemplateTag(node, context, schema, "apollo");
            if (ast) {
              console.log(print(ast));
            }
          }
        },
      };
    },
  }),
};
