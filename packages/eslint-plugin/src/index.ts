import {
  ESLintUtils,
  TSESTree,
  TSESLint,
} from "@typescript-eslint/experimental-utils";
import path from "path";
import {
  OperationDefinitionNode,
  DocumentNode,
  FragmentDefinitionNode,
} from "graphql";
import slash from "slash";
import { handleTemplateTag } from "./parse";
import { getNodes } from "./get-nodes";
import { getConfigSync, Config } from "@ts-gql/config";

const createRule = ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/Thinkmill/ts-gql/blob/master/packages/eslint-plugin/docs/rules/${name}.md`
);

const messages = {
  mustFetchId:
    "The id field on object and interface types must always be fetched if it exists so that caching works reliably",
  noInterpolation:
    'Interpolations are not allowed in gql tags when using @ts-gql/tag. Set "mode" to "no-transform" or "mixed" in your ts-gql config and import @ts-gql/tag',
  onlyInterpolationsAtEnd: "Interpolations in gql tags must be ",
  singleOperation: "GraphQL documents must have only one operation",
  mustBeNamed: "GraphQL operations must have a name",
  mustUseAs: "You must cast gql tags with the generated type",
  operationOrSingleFragment:
    "GraphQL documents must either have a single operation or a single fragment",
  mustBeNamedGql:
    '"@ts-gql/tag"\'s `gql` export must not be renamed when imported because other tags are not widely supported by tools like formatters and syntax highlighters',
  mustImportMainEntrypoint: `Importing "@ts-gql/tag/no-transform" is not allowed when the "mode" is set to "transform"(the default), either switch to using "@ts-gql/tag" or set the "mode" to "no-transform" or "mixed" in your ts-gql config.`,
  mustImportNoTransformEntrypoint: `Importing "@ts-gql/tag" is not allowed when the "mode" is set to "no-transform", either switch to using "@ts-gql/tag/no-transform" or set the "mode" to "transform" or "mixed" in your ts-gql config.`,
};

function checkFragment(
  document: { ast: DocumentNode; document: string },
  node: TSESTree.TaggedTemplateExpression,
  context: TSESLint.RuleContext<MessageId, any>,
  generatedDirectory: string
) {
  if (
    document.ast.definitions.length !== 1 ||
    document.ast.definitions[0].kind !== "FragmentDefinition"
  ) {
    context.report({
      node,
      messageId: "operationOrSingleFragment",
    });
    return;
  }
  let definition = document.ast.definitions[0];

  addNameToGqlTag(node, definition, context, generatedDirectory);
}

function addNameToGqlTag(
  node: TSESTree.TaggedTemplateExpression,
  gqlNode: OperationDefinitionNode | FragmentDefinitionNode,
  context: TSESLint.RuleContext<MessageId, any>,
  generatedDirectory: string
) {
  if (!gqlNode.name) {
    context.report({
      messageId: "mustBeNamed",
      node,
    });
    return false;
  }

  const name = gqlNode.name.value;

  let pathname = slash(
    path.relative(
      path.dirname(context.getFilename()),
      path.join(generatedDirectory, name)
    )
  );

  if (node.parent?.type !== "TSAsExpression") {
    context.report({
      messageId: "mustUseAs",
      node,
      fix(fix) {
        return fix.insertTextAfter(
          node,
          `as import(${JSON.stringify(pathname)}).type`
        );
      },
    });
    return false;
  }
  if (
    node.parent.typeAnnotation.type !== "TSImportType" ||
    node.parent.typeAnnotation.isTypeOf ||
    node.parent.typeAnnotation.parameter.type !== "TSLiteralType" ||
    node.parent.typeAnnotation.parameter.literal.type !== "Literal" ||
    node.parent.typeAnnotation.parameter.literal.value !== pathname ||
    !node.parent.typeAnnotation.qualifier ||
    node.parent.typeAnnotation.qualifier.type !== "Identifier" ||
    node.parent.typeAnnotation.qualifier.name !== "type"
  ) {
    const typeAnnotation = node.parent.typeAnnotation;
    context.report({
      messageId: "mustUseAs",
      node: typeAnnotation,
      fix(fix) {
        return fix.replaceText(
          typeAnnotation,
          `import(${JSON.stringify(pathname)}).type`
        );
      },
    });
    return false;
  }
  return true;
}

function checkDocument(
  document: { ast: DocumentNode; document: string },
  node: TSESTree.TaggedTemplateExpression,
  context: TSESLint.RuleContext<MessageId, any>,
  generatedDirectory: string
) {
  const filteredDefinitions = document.ast.definitions.filter(
    (x): x is OperationDefinitionNode => x.kind === "OperationDefinition"
  );
  if (filteredDefinitions.length === 0) {
    checkFragment(document, node, context, generatedDirectory);
    return;
  }
  if (filteredDefinitions.length !== 1) {
    context.report({
      messageId: "singleOperation",
      node,
    });
    return;
  }
  const [operationNode] = filteredDefinitions;

  addNameToGqlTag(node, operationNode, context, generatedDirectory);
}

export type MessageId = keyof typeof messages;

export const rules = {
  "ts-gql": createRule<[Config?], MessageId>({
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
      schema: [],
    },
    defaultOptions: [],
    create(context) {
      return {
        Program(programNode) {
          let config: Config | undefined = context.options[0];
          let report: typeof context["report"] = (arg) => {
            return context.report(arg);
          };
          let tsGQLImport: "no-transform" | "transform" | undefined = undefined;

          for (const node of programNode.body) {
            if (
              node.type === "ImportDeclaration" &&
              (node.source.value === "@ts-gql/tag" ||
                node.source.value === "@ts-gql/tag/no-transform")
            ) {
              let gqlImportSpecifier = node.specifiers.find(
                (x): x is TSESTree.ImportSpecifier =>
                  x.type === "ImportSpecifier" && x.imported.name === "gql"
              );

              if (!gqlImportSpecifier) continue;
              if (gqlImportSpecifier.local.name !== "gql") {
                report({
                  messageId: "mustBeNamedGql",
                  node: gqlImportSpecifier,
                });
                return;
              }
              if (!config) {
                config = getConfigSync(path.dirname(context.getFilename()));
              }
              if (
                config.mode === "transform" &&
                node.source.value === "@ts-gql/tag/no-transform"
              ) {
                report({
                  messageId: "mustImportMainEntrypoint",
                  node: node.source,
                  fix(fixer) {
                    return fixer.replaceText(
                      node.source,
                      `${node.source.raw[0]}@ts-gql/tag${node.source.raw[0]}`
                    );
                  },
                });
                return;
              }
              if (
                config.mode === "no-transform" &&
                node.source.value === "@ts-gql/tag"
              ) {
                report({
                  messageId: "mustImportNoTransformEntrypoint",
                  node: node.source,
                  fix(fixer) {
                    return fixer.replaceText(
                      node.source,
                      `${node.source.raw[0]}@ts-gql/tag/no-transform${node.source.raw[0]}`
                    );
                  },
                });
                return;
              }
              tsGQLImport =
                node.source.value === "@ts-gql/tag"
                  ? "transform"
                  : "no-transform";
              break;
            }
          }

          if (tsGQLImport === undefined) return;

          for (const node of getNodes(context, programNode)) {
            if (node.type === "TaggedTemplateExpression") {
              if (node.tag.type === "Identifier" && node.tag.name === "gql") {
                if (!config) {
                  config = getConfigSync(path.dirname(context.getFilename()));
                }

                const document = handleTemplateTag(
                  node,
                  report,
                  config.schema(),
                  tsGQLImport
                );
                if (document) {
                  checkDocument(
                    document,
                    node,
                    context,
                    path.join(config.directory, "__generated__", "ts-gql")
                  );
                }
              }
            }
          }
        },
      };
    },
  }),
};
