import { TSESTree, TSESLint } from "@typescript-eslint/experimental-utils";
import { MessageId } from ".";
import {
  parse,
  validate,
  DocumentNode,
  GraphQLSchema,
  specifiedRules,
  NoUnusedFragmentsRule,
} from "graphql";

// https://github.com/apollographql/eslint-plugin-graphql/blob/master/src/createRule.js

function strWithLen(len: number) {
  // from http://stackoverflow.com/questions/14343844/create-a-string-of-variable-length-filled-with-a-repeated-character
  return new Array(len + 1).join("x");
}

// TODO: only remove this on fragment definitions
let rules = specifiedRules.filter((x) => x !== NoUnusedFragmentsRule);

function replaceExpressions(
  node: TSESTree.TemplateLiteral,
  report: TSESLint.RuleContext<MessageId, any>["report"],
  env: "apollo" | "relay" | "lokka" | "fraql"
) {
  const chunks: string[] = [];

  node.quasis.forEach((element, i) => {
    const chunk = element.value.cooked;
    const value = node.expressions[i];

    chunks.push(chunk);

    if (!env || env === "apollo") {
      // In Apollo, interpolation is only valid outside top-level structures like `query` or `mutation`.
      // We'll check to make sure there's an equivalent set of opening and closing brackets, otherwise
      // we're attempting to do an invalid interpolation.
      if (chunk.split("{").length - 1 !== chunk.split("}").length - 1) {
        report({
          node: value || element,
          messageId: "fragmentInterpolationMustBeOutsideBrackets",
        });
        throw new Error("Invalid interpolation");
      }
    }

    if (!element.tail) {
      // Preserve location of errors by replacing with exactly the same length
      const nameLength = value.range[0] - value.range[1];

      if (env === "relay" && /:\s*$/.test(chunk)) {
        // The chunk before this one had a colon at the end, so this
        // is a variable

        // Add 2 for brackets in the interpolation
        const placeholder = strWithLen(nameLength + 2);
        chunks.push("$" + placeholder);
      } else if (env === "lokka" && /\.\.\.\s*$/.test(chunk)) {
        // This is Lokka-style fragment interpolation where you actually type the '...' yourself
        const placeholder = strWithLen(nameLength + 3);
        chunks.push(placeholder);
      } else if (env === "relay") {
        // This is Relay-style fragment interpolation where you don't type '...'
        // Ellipsis cancels out extra characters
        const placeholder = strWithLen(nameLength);
        chunks.push("..." + placeholder);
      } else if (!env || env === "apollo") {
        // In Apollo, fragment interpolation is only valid outside of brackets
        // Since we don't know what we'd interpolate here (that occurs at runtime),
        // we're not going to do anything with this interpolation.
      } else if (env === "fraql") {
        if (chunk.lastIndexOf("{") > chunk.lastIndexOf("}")) {
          chunks.push("__typename");
        }
      } else {
        // Invalid interpolation
        report({
          node: value,
          messageId: "invalidFragmentOrVariable",
        });
        throw new Error("Invalid interpolation");
      }
    }
  });

  return chunks.join("");
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
  schema: GraphQLSchema,
  env: "apollo" | "relay" | "lokka" | "fraql",
  fragments: string[]
) {
  let text;
  try {
    text = replaceExpressions(node.quasi, report, env);
  } catch (e) {
    if (e.message !== "Invalid interpolation") {
      console.log(e); // eslint-disable-line no-console
    }
    return;
  }

  text += "\n" + fragments.join("\n");

  // Re-implement syntax sugar for fragment names, which is technically not valid
  // graphql
  if (
    (env === "lokka" || env === "relay" || env === "fraql") &&
    /fragment\s+on/.test(text)
  ) {
    text = text.replace("fragment", `fragment _`);
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
