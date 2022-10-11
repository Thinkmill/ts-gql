import { DocumentNode } from "graphql";

// TODO: subscriptions

export type BaseTypedDocument = {
  result: any;
  documents: Record<string, TypedDocumentNode<BaseDocumentTypes>>;
  fragments: (a: any) => any;
};

export type BaseTypedQuery = BaseTypedDocument & {
  type: "query";
  variables: any;
};

export type BaseTypedMutation = BaseTypedDocument & {
  type: "mutation";
  variables: any;
};

export type BaseOperations = BaseTypedQuery | BaseTypedMutation;

export type BaseTypedFragment = BaseTypedDocument & {
  name: string;
  type: "fragment";
};

export type BaseDocumentTypes = BaseOperations | BaseTypedFragment;

export type TypedDocumentNode<TypedDocument extends BaseDocumentTypes> =
  DocumentNode & {
    ___type: TypedDocument;
  } & (TypedDocument extends BaseOperations
      ? import("@graphql-typed-document-node/core").TypedDocumentNode<
          TypedDocument["result"],
          TypedDocument["variables"]
        >
      : unknown);

export type OperationData<Node extends TypedDocumentNode<BaseOperations>> =
  Node["___type"]["result"];

export type OperationVariables<Node extends TypedDocumentNode<BaseOperations>> =
  Node["___type"]["variables"];

export type FragmentData<Node extends TypedDocumentNode<BaseTypedFragment>> =
  Node["___type"]["result"];

export type AllDocuments<Node extends TypedDocumentNode<BaseDocumentTypes>> =
  Node["___type"]["documents"];

export declare function gql(strings: TemplateStringsArray): never;

/**
 * @deprecated {@linkcode TypedDocumentNode} is now assignable to {@linkcode DocumentNode}
 * so this call can be removed and the {@linkcode TypedDocumentNode} can be used directly
 */
export function getDocumentNode(
  node: TypedDocumentNode<BaseDocumentTypes>
): DocumentNode;
