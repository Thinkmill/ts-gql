import type {
  DocumentNode,
  FragmentDefinitionNode,
  InlineFragmentNode,
  GraphQLSchema,
  SelectionSetNode,
  FieldNode,
} from "graphql";
import { lazyRequire } from "lazy-require.macro";
import { version } from "graphql/version";

export function inlineIntoFirstOperationOrFragment(
  document: DocumentNode,
  schema: GraphQLSchema
): DocumentNode {
  // we don't want to modify the existing document
  document = JSON.parse(JSON.stringify(document)) as DocumentNode;

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
  const { visit } = lazyRequire<typeof import("graphql/language/visitor")>();

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
  let newDocument = { kind: "Document", definitions: [firstNode] } as const;

  removeUnnecessaryFragmentSpreads(newDocument, schema);

  return newDocument;
}

function findLast<Item, Return>(
  arr: readonly Item[],
  fn: (item: Item) => Return
): Return | undefined {
  let index = arr.length - 1;
  while (index) {
    let item = fn(arr[index]);
    if (item !== undefined) {
      return item;
    }
    index--;
  }
}

const is15OrGreater = Number(version.split(".")[0]) >= 15;

// I'm pretty sure this is incomplete, I think this needs more work for interfaces and unions
function removeUnnecessaryFragmentSpreads(
  document: DocumentNode,
  schema: GraphQLSchema
) {
  const typeInfoExports = lazyRequire<
    typeof import("graphql/utilities/TypeInfo")
  >();
  const { TypeInfo } = typeInfoExports;
  let { visit, visitWithTypeInfo } = lazyRequire<
    typeof import("graphql/language/visitor")
  >();
  if (is15OrGreater) {
    visitWithTypeInfo = (typeInfoExports as any).visitWithTypeInfo;
  }
  const { GraphQLObjectType } = lazyRequire<
    typeof import("graphql/type/definition")
  >();

  let typeInfo = new TypeInfo(schema);

  visit(
    document,
    visitWithTypeInfo(typeInfo, {
      InlineFragment: {
        leave(node, key, parent, path, ancestors) {
          if (
            node.typeCondition &&
            (node.directives === undefined || node.directives.length === 0)
          ) {
            let parentType = typeInfo.getParentType();
            if (!parentType) {
              throw new Error("unexpected no parent type");
            }
            if (parentType instanceof GraphQLObjectType) {
              let selectionSet = findLast(ancestors, (item) => {
                if (item && "kind" in item && item.kind === "SelectionSet") {
                  return item;
                }
              });
              if (!selectionSet) {
                throw new Error(
                  "SelectionSet not found where one was expected to be"
                );
              }
              selectionSet.selections = [
                ...selectionSet.selections.filter((x) => x !== node),
              ];
              mergeSelectionSets(selectionSet, node.selectionSet);
            }
          }
        },
      },
    })
  );
}

// https://github.com/dotansimha/graphql-code-generator/blob/3dac6d8c96eebdd74cb3bb33ce8e376fbc12d848/packages/plugins/other/visitor-plugin-common/src/utils.ts#L338-L373
function mergeSelectionSets(
  selectionSet1: SelectionSetNode,
  selectionSet2: SelectionSetNode
): void {
  const newSelections = [...selectionSet1.selections];
  for (const selection2 of selectionSet2.selections) {
    if (selection2.kind === "FragmentSpread") {
      throw new Error("Unexpected fragment spread");
    }
    const match = newSelections.find(
      (selection1) =>
        selection1.kind === "Field" &&
        selection2.kind === "Field" &&
        getFieldNodeNameValue(selection1) === getFieldNodeNameValue(selection2)
    );

    if (match) {
      if (
        match.kind === "Field" &&
        match.selectionSet &&
        selection2.selectionSet
      ) {
        mergeSelectionSets(match.selectionSet, selection2.selectionSet);
      }
      continue;
    }
    newSelections.push(selection2);
  }
  selectionSet1.selections = newSelections;
}

export const getFieldNodeNameValue = (node: FieldNode): string => {
  return (node.alias || node.name).value;
};
