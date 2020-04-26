import {
  ESLintUtils,
  TSESTree,
  TSESLint,
} from "@typescript-eslint/experimental-utils";

import path from "path";

import {
  OperationDefinitionNode,
  GraphQLSchema,
  DocumentNode,
  FragmentDefinitionNode,
} from "graphql";
import { handleTemplateTag } from "./parse";
import { getSchemaFromOptions } from "./get-schema";
import { ensureSchemaTypesAreWritten } from "./schema-types";
import { ensureOperationTypesAreWritten } from "./operation-types";
import fs from "fs-extra";
import { parseTsGqlMeta } from "./utils";
import { getNodes } from "./get-nodes";
import { getParserServices } from "./get-parser-services";

const createRule = ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/Thinkmill/ts-gql/blob/master/packages/eslint-plugin/docs/rules/${name}.md`
);

const messages = {
  fragmentInterpolationMustBeOutsideBrackets:
    "Invalid interpolation - fragment interpolation must occur outside of the brackets.",
  invalidFragmentOrVariable:
    "Invalid interpolation - not a valid fragment or variable.",
  singleOperation: "GraphQL documents must have only one operation",
  mustBeNamed: "GraphQL operations must have a name",
  mustCallWithOperationName:
    "You must call the result with the name of the GraphQL operation or fragment",

  invalidGeneratedDirectory:
    "The directory with generated types is in an incorrect state",
  invalidGeneratedDirectorySchema:
    "The generated schema types are in an incorrect state",
  operationOrSingleFragment:
    "GraphQL documents must either have a single operation or a single fragment",
  couldNotFindFragmentType: "Could not get fragment type",
};

function ensureNoExtraneousFilesExist(
  directory: string,
  currentContents: string,
  currentFilename: string
) {
  // TODO: investigate perf implications of this
  const result = fs.readdirSync(directory);
  const filesToDelete: string[] = [];
  result.forEach((filename) => {
    if (filename === "@schema.d.ts") {
      return;
    }
    const filepath = path.join(directory, filename);

    const contents = fs.readFileSync(filepath, "utf8");
    const meta = parseTsGqlMeta(contents);
    const srcFilename = path.resolve(directory, meta.filename);
    const srcContents =
      srcFilename === currentFilename
        ? currentContents
        : fs.readFileSync(srcFilename, "utf8");
    if (!srcContents.includes(meta.partial)) {
      filesToDelete.push(filepath);
    }
  });
  if (filesToDelete.length) {
    filesToDelete.forEach((filename) => {
      console.log({ delete: filename });

      fs.removeSync(filename);
    });
  }
}

function checkFragment(
  document: { ast: DocumentNode; document: string },
  node: TSESTree.TaggedTemplateExpression,
  report: TSESLint.RuleContext<MessageId, any>["report"],
  schema: { schema: GraphQLSchema; hash: string },
  generatedDirectory: string,
  currentFilename: string
) {
  if (
    document.ast.definitions.length !== 1 ||
    document.ast.definitions[0].kind !== "FragmentDefinition"
  ) {
    report({
      node,
      messageId: "operationOrSingleFragment",
    });
    return;
  }
  let definition = document.ast.definitions[0];

  if (addNameToGqlTag(node, definition, report)) {
    ensureOperationTypesAreWritten(
      schema.schema,
      document,
      { ...definition, operation: "fragment" } as any,
      path.join(generatedDirectory, `${definition.name.value}.d.ts`),
      currentFilename,
      schema.hash,
      definition.name.value
    );
  }
}

function addNameToGqlTag(
  node: TSESTree.TaggedTemplateExpression,
  gqlNode: OperationDefinitionNode | FragmentDefinitionNode,
  report: TSESLint.RuleContext<MessageId, any>["report"]
) {
  if (!gqlNode.name) {
    report({
      messageId: "mustBeNamed",
      node,
    });
    return false;
  }

  const name = gqlNode.name.value;

  if (node.parent?.type !== "CallExpression") {
    report({
      messageId: "mustCallWithOperationName",
      node,
      fix(fix) {
        return fix.insertTextAfter(node, `(${JSON.stringify(name)})`);
      },
    });
    return false;
  }
  if (
    node.parent.arguments.length !== 1 ||
    node.parent.arguments[0].type !== "Literal" ||
    node.parent.arguments[0].value !== name
  ) {
    const parent = node.parent;

    report({
      messageId: "mustCallWithOperationName",
      node: parent,
      fix(fix) {
        return fix.replaceTextRange(
          [node.range[1], parent.range[1]],
          `(${JSON.stringify(name)})`
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
  report: TSESLint.RuleContext<MessageId, any>["report"],
  schema: { schema: GraphQLSchema; hash: string },
  generatedDirectory: string,
  currentFilename: string
) {
  const filteredDefinitions = document.ast.definitions.filter(
    (x): x is OperationDefinitionNode => x.kind === "OperationDefinition"
  );
  if (filteredDefinitions.length === 0) {
    checkFragment(
      document,
      node,
      report,
      schema,
      generatedDirectory,
      currentFilename
    );
    return;
  }
  if (filteredDefinitions.length !== 1) {
    report({
      messageId: "singleOperation",
      node,
    });
    return;
  }
  const [operationNode] = filteredDefinitions;

  if (addNameToGqlTag(node, operationNode, report)) {
    ensureOperationTypesAreWritten(
      schema.schema,
      document,
      operationNode,
      path.join(generatedDirectory, `${operationNode.name!.value}.d.ts`),
      currentFilename,
      schema.hash,
      operationNode.name!.value
    );
  }
}

export type MessageId = keyof typeof messages;

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
        Program(programNode) {
          let schema:
            | {
                schema: GraphQLSchema;
                hash: string;
              }
            | undefined;
          const generatedDirectory = context.options[0].generatedDirectory;
          let hasReportedAnError = false;
          let report: typeof context["report"] = (arg) => {
            hasReportedAnError = true;
            return context.report(arg);
          };
          const parserServices = getParserServices(context);
          NodesLoop: for (const node of getNodes(context, programNode)) {
            if (node.type === "TaggedTemplateExpression") {
              if (node.tag.type === "Identifier" && node.tag.name === "gql") {
                let typeChecker = parserServices.program.getTypeChecker();
                let gqlTagNode = parserServices.esTreeNodeToTSNodeMap.get(
                  node.tag
                );
                let type = typeChecker.getTypeAtLocation(gqlTagNode);
                if (!type.getProperty("___isTsGqlTag")) {
                  continue;
                }
                if (!schema) {
                  const gqlSchema = getSchemaFromOptions(context.options[0]);

                  schema = {
                    schema: gqlSchema,
                    hash: ensureSchemaTypesAreWritten(
                      gqlSchema,
                      generatedDirectory
                    ),
                  };
                }

                let fragments: string[] = [];
                for (let expression of node.quasi.expressions) {
                  let expressionTsNode = parserServices.esTreeNodeToTSNodeMap.get(
                    expression
                  );
                  let type = typeChecker.getTypeAtLocation(expressionTsNode);
                  let internalTypesSymbol = type.getProperty("___type");
                  if (!internalTypesSymbol) {
                    report({
                      node: expression,
                      messageId: "couldNotFindFragmentType",
                    });
                    continue NodesLoop;
                  }
                  let internalTypes = typeChecker.getTypeOfSymbolAtLocation(
                    internalTypesSymbol,
                    internalTypesSymbol.valueDeclaration
                  );

                  let internalTypesDocumentSymbol = internalTypes.getProperty(
                    "document"
                  );
                  if (!internalTypesDocumentSymbol) {
                    report({
                      node: expression,
                      messageId: "couldNotFindFragmentType",
                    });
                    continue NodesLoop;
                  }

                  let internalTypesDocument = typeChecker.getTypeOfSymbolAtLocation(
                    internalTypesDocumentSymbol,
                    internalTypesDocumentSymbol.valueDeclaration
                  );

                  if (!internalTypesDocument.isStringLiteral()) {
                    report({
                      node: expression,
                      messageId: "couldNotFindFragmentType",
                    });
                    continue NodesLoop;
                  }
                  fragments.push(internalTypesDocument.value);
                }

                const document = handleTemplateTag(
                  node,
                  report,
                  schema.schema,
                  "apollo",
                  fragments
                );
                if (document) {
                  checkDocument(
                    document,
                    node,
                    report,
                    schema,
                    generatedDirectory,
                    context.getFilename()
                  );
                }
              }
            }
          }
          if (schema && !hasReportedAnError) {
            console.log("remove extraneous");
            ensureNoExtraneousFilesExist(
              generatedDirectory,
              context.getSourceCode().text,
              context.getFilename()
            );
          }
        },
      };
    },
  }),
};
