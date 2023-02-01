// loosely based off https://github.com/discord/eslint-traverse/blob/master/index.js

import { TSESLint, TSESTree } from "@typescript-eslint/experimental-utils";

export function* getNodes(
  context: TSESLint.RuleContext<any, any>,
  node: TSESTree.Node
) {
  let allVisitorKeys = context.getSourceCode().visitorKeys;
  let queue = [node];

  while (queue.length) {
    let currentNode = queue.shift()!;

    yield currentNode;

    let visitorKeys = allVisitorKeys[currentNode.type];
    if (!visitorKeys) continue;

    for (let visitorKey of visitorKeys) {
      let child = (currentNode as any)[visitorKey] as
        | TSESTree.Node
        | TSESTree.Node[]
        | undefined;

      if (!child) {
        continue;
      } else if (Array.isArray(child)) {
        for (const node of child) {
          if (node) {
            queue.push(node);
          }
        }
      } else {
        queue.push(child);
      }
    }
  }
}
