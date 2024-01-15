export type {
  AllDocuments,
  BaseDocumentTypes,
  BaseOperations,
  BaseTypedDocument,
  BaseTypedFragment,
  BaseTypedMutation,
  BaseTypedQuery,
  FragmentData,
  OperationData,
  OperationVariables,
  TypedDocumentNode,
} from ".";
export { getDocumentNode } from ".";
import { TypedDocumentNode, BaseTypedFragment } from ".";

type ProvidedFragments<T> = (requiredFragments: T) => T;

type TypedDocumentNodeToBeCast<Fragment extends string> = {
  kind: unknown;
  definitions: unknown;
  ___type: {
    type: "query" | "fragment" | "mutation";
    result: any;
    variables: any;
    documents: any;
    name: any;
    fragments: ProvidedFragments<
      [Fragment] extends [never]
        ? "none"
        : {
            [Key in Fragment]: true;
          }
    >;
  };
};

export declare function gql<
  Fragments extends TypedDocumentNode<BaseTypedFragment>[]
>(
  strings: TemplateStringsArray,
  ...fragments: [...Fragments]
): TypedDocumentNodeToBeCast<Fragments[number]["___type"]["name"]>;
