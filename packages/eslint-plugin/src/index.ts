import { ESLintUtils } from "@typescript-eslint/experimental-utils";

import path from "path";

import { OperationDefinitionNode, GraphQLSchema } from "graphql";
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
    "You must call the result of the gql tag with the operation name",
  invalidGeneratedDirectory:
    "The directory with generated types is in an incorrect state",
  invalidGeneratedDirectorySchema:
    "The generated schema types are in an incorrect state",
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
    if (!srcContents.includes(meta.document)) {
      filesToDelete.push(filepath);
    }
  });
  if (filesToDelete.length) {
    filesToDelete.forEach((filename) => {
      fs.removeSync(filename);
    });
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
          for (const node of getNodes(context, programNode)) {
            if (node.type === "TaggedTemplateExpression") {
              if (node.tag.type === "Identifier" && node.tag.name === "gql") {
                let typeChecker = parserServices.program.getTypeChecker();
                let gqlTagNode = parserServices.esTreeNodeToTSNodeMap.get(
                  node.tag
                );
                if (!gqlTagNode) {
                  throw new Error("Could not get gql tag TS node");
                }
                let gqlTagSymbol = typeChecker.getSymbolAtLocation(gqlTagNode);
                if (!gqlTagSymbol) {
                  throw new Error("Could not get gql symbol TS node");
                }
                let type = typeChecker.getTypeOfSymbolAtLocation(
                  gqlTagSymbol,
                  gqlTagNode
                );
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

                const operation = handleTemplateTag(
                  node,
                  report,
                  schema.schema,
                  "apollo"
                );
                if (operation) {
                  const filteredDefinitions: [
                    OperationDefinitionNode
                  ] = operation.ast.definitions.filter(
                    (x) => x.kind === "OperationDefinition"
                  ) as any;
                  if (filteredDefinitions.length !== 1) {
                    report({
                      messageId: "singleOperation",
                      node,
                    });
                    return;
                  }
                  const [operationNode] = filteredDefinitions;

                  if (!operationNode.name) {
                    report({
                      messageId: "mustBeNamed",
                      node,
                    });
                    return;
                  }
                  const name = operationNode.name.value;

                  if (node.parent?.type !== "CallExpression") {
                    report({
                      messageId: "mustCallWithOperationName",
                      node,
                      fix(fix) {
                        return fix.insertTextAfter(
                          node,
                          `(${JSON.stringify(name)})`
                        );
                      },
                    });
                    return;
                  }
                  if (
                    node.parent.arguments.length !== 1 ||
                    node.parent.arguments[0].type !== "Literal" ||
                    node.parent.arguments[0].value !== name
                  ) {
                    const parent = node.parent;

                    report({
                      messageId: "mustCallWithOperationName",
                      node,
                      fix(fix) {
                        return fix.replaceTextRange(
                          [
                            parent.arguments[0].range[0],
                            parent.arguments[parent.arguments.length - 1]
                              .range[1],
                          ],
                          JSON.stringify(name)
                        );
                      },
                    });
                    return;
                  }
                  ensureOperationTypesAreWritten(
                    schema.schema,
                    operation,
                    path.join(
                      context.options[0].generatedDirectory,
                      `${name}.d.ts`
                    ),
                    context.getFilename(),
                    schema.hash,
                    name
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
