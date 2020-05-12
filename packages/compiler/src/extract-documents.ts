import fs from "fs-extra";
import { Node } from "@babel/types";
import { parse as babelParse } from "@babel/parser";
import { CompilerError, FullSourceLocation } from "./types";

type BabelVisitors = {
  [Type in Node["type"]]?: (node: Extract<Node, { type: Type }>) => void;
};

function babelVisit(node: Node, visitors: BabelVisitors) {
  const visitor = visitors[node.type];
  if (visitor !== undefined) {
    // @ts-ignore
    visitor(node);
    return;
  }
  babelTraverse(node, visitors);
}

function babelTraverse(node: Node, visitors: BabelVisitors) {
  for (const key in node) {
    // @ts-ignore
    const prop = node[key];
    if (prop && typeof prop === "object" && typeof prop.type === "string") {
      babelVisit(prop, visitors);
    } else if (Array.isArray(prop)) {
      prop.forEach((item) => {
        if (item && typeof item === "object" && typeof item.type === "string") {
          babelVisit(item, visitors);
        }
      });
    }
  }
}

export async function extractGraphQLDocumentsContentsFromFile(
  filename: string
) {
  let errors: CompilerError[] = [];
  let documents: {
    loc: FullSourceLocation;
    document: string;
  }[] = [];
  let content = await fs.readFile(filename, "utf8");
  if (/gql\s*`/.test(content)) {
    try {
      let ast = babelParse(content, {
        allowImportExportEverywhere: true,
        allowReturnOutsideFunction: true,
        allowSuperOutsideMethod: true,
        sourceType: "module",
        plugins: [
          "asyncGenerators",
          "classProperties",
          ["decorators", { decoratorsBeforeExport: true }],
          "doExpressions",
          "dynamicImport",
          "typescript",
          "functionBind",
          "functionSent",
          "jsx",
          "nullishCoalescingOperator",
          "objectRestSpread",
          "optionalChaining",
          "optionalCatchBinding",
        ],
        strictMode: false,
      });
      babelTraverse(ast, {
        TSAsExpression(node) {
          // TODO: verify operation name === import
          if (
            node.typeAnnotation.type === "TSImportType" &&
            node.expression.type === "TaggedTemplateExpression"
          ) {
            let isGqlTag =
              node.expression.tag.type === "Identifier" &&
              node.expression.tag.name === "gql";
            let hasNoInterpolations =
              node.expression.quasi.quasis.length === 1 &&
              node.expression.quasi.expressions.length === 0;
            if (isGqlTag && hasNoInterpolations) {
              documents.push({
                loc: node.expression.quasi.loc!,
                document: node.expression.quasi.quasis[0].value.cooked!,
              });
            }
          }
        },
      });
    } catch (err) {
      errors.push({ message: err.message, loc: err.loc, filename });
    }
  }
  return { errors, documents };
}
