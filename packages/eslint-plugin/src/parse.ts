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
  NoUndefinedVariablesRule,
  ValidationRule,
  GraphQLError,
} from "graphql";
import { VariableUsage } from "graphql/validation/ValidationContext";

// loosely based on https://github.com/apollographql/eslint-plugin-graphql/blob/master/src/createRule.js

// TODO: also do some of this
let rules = specifiedRules.filter(
  (x) =>
    x !== NoUnusedFragmentsRule &&
    x !== NoUnusedVariablesRule &&
    x !== KnownFragmentNamesRule &&
    x !== NoUndefinedVariablesRule
);

function replaceExpressions(
  node: TSESTree.TemplateLiteral,
  report: TSESLint.RuleContext<MessageId, any>["report"],
  kind: "transform" | "no-transform"
) {
  if (node.expressions.length) {
    if (kind === "transform") {
      report({
        node: node.expressions[0],
        messageId: "noInterpolation",
      });
      return undefined;
    }
    if (kind === "no-transform") {
      for (const templateElement of node.quasis.slice(1)) {
        if (templateElement.value.cooked.trim().length) {
          report({
            node: templateElement,
            messageId: "onlyInterpolationsAtEnd",
          });
          return undefined;
        }
      }
    }
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

export function handleTemplateTag(
  node: TSESTree.TaggedTemplateExpression,
  report: TSESLint.RuleContext<MessageId, any>["report"],
  schema: GraphQLSchema,
  kind: "transform" | "no-transform"
) {
  let text = replaceExpressions(node.quasi, report, kind);

  if (text === undefined) {
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

  const validationErrors = validate(
    schema,
    ast,
    rules.concat(createNoUndefinedVariablesRule(node, report))
  );
  validationErrors.forEach((error) => {
    report({
      node,
      // @ts-ignore
      message: error.message,
      loc: locFromGraphQLError(node, error),
    });
  });
  if (validationErrors.length) return;
  let typeInfo = new TypeInfo(schema);
  visit(
    ast,
    visitWithTypeInfo(typeInfo, {
      SelectionSet(selectionSetNode, key, parent) {
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
        let selectionSetAlreadyHasId = selectionSetNode.selections.some(
          (x) => x.kind === "Field" && x.name.value === "id"
        );
        if (selectionSetAlreadyHasId) {
          return;
        }
        let isOnlyFragmentSpread = selectionSetNode.selections.every(
          (x) => x.kind === "FragmentSpread"
        );
        if (isOnlyFragmentSpread) {
          return;
        }

        if (
          parent &&
          !Array.isArray(parent) &&
          (parent as any).kind === "InlineFragment"
        ) {
          let parentType = (typeInfo as any)._parentTypeStack[
            (typeInfo as any)._parentTypeStack.length - 2
          ];
          if (
            parentType instanceof GraphQLInterfaceType &&
            parentType.getFields().id
          ) {
            return;
          }
        }

        if (type.getFields().id) {
          let fixPosition =
            selectionSetNode.loc!.start + node.quasi.range[0] + 2;
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

function createNoUndefinedVariablesRule(
  taggedTemplateNode: TSESTree.TaggedTemplateExpression,
  report: TSESLint.RuleContext<MessageId, any>["report"]
): ValidationRule {
  return (context) => {
    let variableNameDefined = Object.create(null);

    return {
      OperationDefinition: {
        enter() {
          variableNameDefined = Object.create(null);
        },
        leave(operation) {
          const usages: VariableUsage[] = (
            context as any
          ).getRecursiveVariableUsages(operation);

          for (const { node, type } of usages) {
            const varName = node.name.value;

            if (variableNameDefined[varName] !== true) {
              let message = operation.name
                ? `Variable "$${varName}" is not defined by operation "${operation.name.value}".`
                : `Variable "$${varName}" is not defined.`;
              if (operation.name && type) {
                let printedType = type.toString();
                let add = taggedTemplateNode.quasi.range[0] + 1;
                let fixPosition =
                  (operation.variableDefinitions?.length
                    ? operation.variableDefinitions[
                        operation.variableDefinitions.length - 1
                      ].loc!.end
                    : operation.name.loc!.end) + add;
                let fixString = operation.variableDefinitions?.length
                  ? `, $${varName}: ${printedType}`
                  : `($${varName}: ${printedType})`;
                report({
                  // @ts-ignore
                  message,
                  fix(fixer) {
                    return fixer.insertTextAfterRange(
                      [fixPosition, fixPosition],
                      fixString
                    );
                  },
                  loc: locFromGraphQLNode(taggedTemplateNode, node),
                });
              } else
                context.reportError(
                  new GraphQLError(message, [node, operation])
                );
            }
          }
        },
      },
      VariableDefinition(node) {
        variableNameDefined[node.variable.name.value] = true;
      },
    };
  };
}
