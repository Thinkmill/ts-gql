import type { Node } from "@babel/types";
import { lazyRequire } from "lazy-require.macro";
import ts from "typescript";
import { CompilerError } from "./types";

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

let tsxScanner: import("typescript").Scanner;
let tsScanner: import("typescript").Scanner;

export function extractGraphQLDocumentsContentsFromFile(
  filename: string,
  content: string
) {
  let errors: CompilerError[] = [];
  let documents: {
    loc: { start: number; end: number };
    document: string;
  }[] = [];
  if (/gql\s*`/.test(content)) {
    try {
      const ts = lazyRequire<typeof import("typescript")>();

      let scanner: import("typescript").Scanner;
      if (filename[filename.length - 1] === "x") {
        if (tsxScanner === undefined) {
          tsxScanner = ts.createScanner(
            ts.ScriptTarget.Latest,
            false,
            ts.LanguageVariant.JSX
          );
        }
        scanner = tsxScanner;
      } else {
        if (tsScanner === undefined) {
          tsScanner = ts.createScanner(
            ts.ScriptTarget.Latest,
            false,
            ts.LanguageVariant.Standard
          );
        }
        scanner = tsScanner;
      }
      scanner.setText(content);
      scanner.setTextPos(0);
      let token = scanner.scan();
      let lastToken: ts.SyntaxKind = token;
      let lastWasGql = false;
      while (token !== ts.SyntaxKind.EndOfFileToken) {
        if (
          token === ts.SyntaxKind.Identifier &&
          lastToken !== ts.SyntaxKind.DotToken
        ) {
          if (scanner.getTokenValue() === "gql") {
            lastWasGql = true;
            continue;
          }
        } else if (lastWasGql) {
          if (token === ts.SyntaxKind.NoSubstitutionTemplateLiteral) {
            const start = scanner.getTokenPos();
            documents.push({
              document: scanner.getTokenValue(),
              loc: {
                start,
                end: start + scanner.getTokenText().length,
              },
            });
          }
        }
        lastWasGql = false;
        lastToken = token;
        token = scanner.scan();
      }

      // babelTraverse(ast , {
      //   TSAsExpression(node) {
      //     if (
      //       node.typeAnnotation.type === "TSImportType" &&
      //       node.expression.type === "TaggedTemplateExpression"
      //     ) {
      //       let isGqlTag =
      //         node.expression.tag.type === "Identifier" &&
      //         node.expression.tag.name === "gql";
      //       let hasOnlyWhitespaceAfterFirstInterpolation =
      //         node.expression.quasi.quasis
      //           .slice(1)
      //           .every((x) => x.value.cooked!.trim() === "");
      //       if (isGqlTag && hasOnlyWhitespaceAfterFirstInterpolation) {
      //         documents.push({
      //           loc: node.expression.quasi.loc!,
      //           document: node.expression.quasi.quasis[0].value.cooked!,
      //         });
      //       }
      //     }
      //   },
      // });
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
