import { DocumentNode } from "graphql";

// TODO: subscriptions

export type BaseTypedDocument = {
  result: any;
  documents: Record<string, BaseDocumentTypes>;
};

export type BaseTypedQuery = BaseTypedDocument & {
  type: "query";
  variables: Record<string, any> | undefined;
};

export type BaseTypedMutation = BaseTypedDocument & {
  type: "mutation";
  variables: Record<string, any> | undefined;
};

export type BaseOperations = BaseTypedQuery | BaseTypedMutation;

export type BaseTypedFragment = BaseTypedDocument & {
  type: "fragment";
};

export type BaseDocumentTypes = BaseOperations | BaseTypedFragment;

export type TypedDocumentNode<TypedDocument extends BaseDocumentTypes> = {
  ___type: TypedDocument;
};

export type OperationData<
  Node extends TypedDocumentNode<BaseOperations>
> = Node["___type"]["result"];

export type OperationVariables<
  Node extends TypedDocumentNode<BaseOperations>
> = Node["___type"]["variables"];

export type FragmentData<
  Node extends TypedDocumentNode<BaseTypedFragment>
> = Node["___type"]["result"];

export type AllDocuments<
  Node extends TypedDocumentNode<BaseDocumentTypes>
> = Node["___type"]["documents"];

interface GqlTag {
  (
    strings: readonly string[],
    ...interpolations: TypedDocumentNode<BaseTypedFragment>[]
  ): never;
  ___isTsGqlTag: true;
}

export declare const gql: GqlTag;

export function getDocumentNode(
  node: TypedDocumentNode<BaseDocumentTypes>
): DocumentNode;

export interface Documents {}
