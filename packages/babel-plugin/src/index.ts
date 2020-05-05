import { PluginObj } from "@babel/core";
import nodePath from "path";
// @ts-ignore
import { addNamed } from "@babel/helper-module-imports";

export default function plugin(): PluginObj {
  return {
    visitor: {
      TSAsExpression(asExpressionPath) {
        let expressionPath = asExpressionPath.get("expression");
        if (
          expressionPath.node.type === "TaggedTemplateExpression" &&
          expressionPath.node.tag.type === "Identifier" &&
          expressionPath.node.tag.name === "gql" &&
          asExpressionPath.node.type === "TSAsExpression" &&
          asExpressionPath.node.typeAnnotation.type === "TSImportType"
        ) {
          expressionPath.replaceWith(
            addNamed(
              expressionPath,
              "document",
              asExpressionPath.node.typeAnnotation.argument.value,
              {
                nameHint: nodePath.basename(
                  asExpressionPath.node.typeAnnotation.argument.value
                ),
              }
            )
          );
        }
      },
    },
  };
}
