import { TSESTree, TSESLint } from "@typescript-eslint/experimental-utils";
import { MessageId } from ".";
import {
  parse,
  validate,
  DocumentNode,
  GraphQLSchema,
  specifiedRules,
  NoUnusedFragmentsRule,
  NoUnusedVariablesRule,
  KnownFragmentNamesRule,
} from "graphql";

// loosely based on https://github.com/apollographql/eslint-plugin-graphql/blob/master/src/createRule.js

// TODO: also do some of this
let rules = specifiedRules.filter(
  (x) =>
    x !== NoUnusedFragmentsRule &&
    x !== NoUnusedVariablesRule &&
    x !== KnownFragmentNamesRule
);

function replaceExpressions(
  node: TSESTree.TemplateLiteral,
  report: TSESLint.RuleContext<MessageId, any>["report"]
) {
  if (node.expressions.length) {
    report({
      node: node.expressions[0],
      messageId: "noInterpolation",
    });
    throw new Error("Invalid interpolation");
  }
  return node.quasis[0].value.cooked;
}

function locFrom(node: TSESTree.TaggedTemplateExpression, error: any) {
  if (!error.locations || !error.locations.length) {
    return;
  }
  const location = error.locations[0];

  let line;
  let column;
  if (location.line === 1) {
    line = node.loc.start.line;
    column = node.tag.loc.end.column + location.column;
  } else {
    line = node.loc.start.line + location.line - 1;
    column = location.column - 1;
  }

  return {
    line,
    column,
  };
}

export function handleTemplateTag(
  node: TSESTree.TaggedTemplateExpression,
  report: TSESLint.RuleContext<MessageId, any>["report"],
  schema: GraphQLSchema
) {
  let text;
  try {
    text = replaceExpressions(node.quasi, report);
  } catch (e) {
    if (e.message !== "Invalid interpolation") {
      console.log(e); // eslint-disable-line no-console
    }
    return;
  }

  let ast: DocumentNode;

  try {
    ast = parse(text);
  } catch (error) {
    report({
      node,
      // @ts-ignore
      message: error.message.split("\n")[0],
      loc: locFrom(node, error),
    });
    return;
  }

  const validationErrors = schema ? validate(schema, ast, rules) : [];
  if (validationErrors && validationErrors.length > 0) {
    report({
      node,
      // @ts-ignore
      message: validationErrors[0].message,
      loc: locFrom(node, validationErrors[0]),
    });
    return;
  }
  return { ast, document: text };
}
