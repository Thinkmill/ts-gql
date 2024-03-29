import type { Node } from "@babel/types";
import { lazyRequire } from "lazy-require.macro";
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

export function extractGraphQLDocumentsContentsFromFile(
  filename: string,
  content: string
) {
  let errors: CompilerError[] = [];
  let documents: {
    loc: FullSourceLocation;
    document: string;
  }[] = [];
  if (/gql\s*`/.test(content)) {
    try {
      let ast = lazyRequire<typeof import("@babel/parser")>().parse(content, {
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
      babelTraverse(ast as any, {
        TSAsExpression(node) {
          // TODO: verify operation name === import
          if (
            node.typeAnnotation.type === "TSImportType" &&
            node.expression.type === "TaggedTemplateExpression"
          ) {
            let isGqlTag =
              node.expression.tag.type === "Identifier" &&
              node.expression.tag.name === "gql";
            let hasOnlyWhitespaceAfterFirstInterpolation =
              node.expression.quasi.quasis
                .slice(1)
                .every((x) => x.value.cooked!.trim() === "");
            if (isGqlTag && hasOnlyWhitespaceAfterFirstInterpolation) {
              documents.push({
                loc: node.expression.quasi.loc!,
                document: node.expression.quasi.quasis[0].value.cooked!,
              });
            }
          }
        },
      });
    } catch (err) {
      if (typeof err.loc?.line === "number") {
        errors.push({
          filename,
          message: err.message.replace(
            ` (${err.loc.line}:${err.loc.column})`,
            ""
          ),
          loc: { start: err.loc },
        });
      } else {
        errors.push({ filename, message: err.message });
      }
    }
  }
  return { errors, documents };
}
