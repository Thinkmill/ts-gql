import {
  DocumentNode,
  FragmentDefinitionNode,
  visit,
  print,
  parse,
  InlineFragmentNode,
} from "graphql";

export function inlineIntoFirstOperationOrFragment(
  document: DocumentNode
): DocumentNode {
  // we don't want to modify the existing document
  document = parse(print(document));

  let firstNode = document.definitions[0];
  if (
    firstNode.kind !== "FragmentDefinition" &&
    firstNode.kind !== "OperationDefinition"
  ) {
    throw new Error(
      "First node must be a FragmentDefinition or OperationDefinition"
    );
  }
  let fragmentsByName: Record<string, FragmentDefinitionNode> = {};

  document.definitions.forEach((x, i) => {
    if (i === 0) return;
    if (x.kind !== "FragmentDefinition") {
      throw new Error("All non-first nodes must be FragmentDefinition nodes");
    }
    fragmentsByName[x.name.value] = x;
  });

  visit(document, {
    FragmentSpread(node, key, parent) {
      let fragment = fragmentsByName[node.name.value];
      if (!Array.isArray(parent)) {
        throw new Error("Unexpected fragment");
      }
      if (typeof key !== "number") {
        throw new Error("unexpected non-number key");
      }
      let inlineSpread: InlineFragmentNode = {
        kind: "InlineFragment",
        selectionSet: fragment.selectionSet,
        typeCondition: fragment.typeCondition,
      };
      parent[key] = inlineSpread;
    },
  });
  return { kind: "Document", definitions: [firstNode] };
}
