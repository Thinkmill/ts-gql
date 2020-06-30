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
  visitWithTypeInfo,
  visit,
  TypeInfo,
  GraphQLInterfaceType,
  GraphQLObjectType,
  GraphQLUnionType,
  GraphQLNonNull,
  GraphQLList,
  ASTNode,
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

function locFromGraphQLError(
  node: TSESTree.TaggedTemplateExpression,
  error: any
) {
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

function locFromGraphQLNode(
  node: TSESTree.TaggedTemplateExpression,
  graphQLNode: ASTNode
) {
  return {
    start: {
      line: node.loc.start.line + graphQLNode.loc!.startToken.line - 1,
      column:
        graphQLNode.loc!.startToken.line === 1
          ? node.loc.start.column + graphQLNode.loc!.startToken.column + 1
          : graphQLNode.loc!.startToken.column,
    },
    end: {
      line: node.loc.start.line + graphQLNode.loc!.endToken.line - 1,
      column:
        graphQLNode.loc!.endToken.line === 1
          ? node.loc.start.column + graphQLNode.loc!.endToken.column + 1
          : graphQLNode.loc!.endToken.column,
    },
  };
}

function checkRequestsId() {}

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
      loc: locFromGraphQLError(node, error),
    });
    return;
  }
  const validationErrors = schema ? validate(schema, ast, rules) : [];
  if (validationErrors && validationErrors.length > 0) {
    report({
      node,
      // @ts-ignore
      message: validationErrors[0].message,
      loc: locFromGraphQLError(node, validationErrors[0]),
    });
    return;
  }
  let typeInfo = new TypeInfo(schema);
  visit(
    ast,
    visitWithTypeInfo(typeInfo, {
      SelectionSet(selectionSetNode) {
        let type = typeInfo.getType();
        if (!type) {
          throw new Error(
            "Type for SelectionSet not found. This is an internal error. If you see this, this is most likely a bug in ts-gql"
          );
        }
        if (type instanceof GraphQLUnionType) {
          return;
        }
        if (type instanceof GraphQLNonNull) {
          type = type.ofType;
        }

        if (type instanceof GraphQLList) {
          type = type.ofType;
          if (type instanceof GraphQLNonNull) {
            type = type.ofType;
          }
        }

        if (
          !(
            type instanceof GraphQLInterfaceType ||
            type instanceof GraphQLObjectType
          )
        ) {
          throw new Error(
            `Unexpected SelectionSet on type of ${
              (type as any).constructor.name
            }. This is an internal error. If you see this, this is most likely a bug in ts-gql`
          );
        }
        if (!selectionSetNode.selections[0]) {
          throw new Error(
            "SelctionSet must have at least one selection. This is an internal error. If you see this, this is most likely a bug in ts-gql"
          );
        }
        if (!selectionSetNode.selections[0].loc || !selectionSetNode.loc) {
          throw new Error(
            "Location not found for selection. This is an internal error. If you see this, this is most likely a bug in ts-gql"
          );
        }

        if (
          type.getFields()["id"] &&
          !selectionSetNode.selections.some(
            (x) => x.kind === "Field" && x.name.value === "id"
          ) &&
          !selectionSetNode.selections.every((x) => x.kind !== "Field")
        ) {
          let fixPosition =
            selectionSetNode.loc?.start + node.quasi.range[0] + 2;
          let fixText =
            "\n" +
            "".padStart(
              selectionSetNode.selections[0].loc.startToken.column - 1
            ) +
            "id";
          report({
            messageId: "mustFetchId",
            node,
            loc: locFromGraphQLNode(node, selectionSetNode),
            fix(fixer) {
              return fixer.insertTextAfterRange(
                [fixPosition, fixPosition],
                fixText
              );
            },
          });
        }
      },
    })
  );
  return { ast, document: text };
}
