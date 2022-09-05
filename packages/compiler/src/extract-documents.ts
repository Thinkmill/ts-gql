import type { Node } from "@babel/types";
import { lazyRequire } from "lazy-require.macro";

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
  let documents: {
    loc: { start: number; end: number };
    document: string;
  }[] = [];
  if (/gql\s*`/.test(content)) {
    const ts = lazyRequire<typeof import("typescript")>();

    const sourceFile = ts.createSourceFile(
      filename,
      content,
      ts.ScriptTarget.Latest,
      true
    );

    ts.forEachChild(sourceFile, (node) => {
      if (
        ts.isAsExpression(node) &&
        ts.isTaggedTemplateExpression(node.expression) &&
        node.expression.tag.getText(sourceFile) === "gql" &&
        ts.isImportTypeNode(node.type)
      ) {
      }
    });
  }
  return { documents };
}
