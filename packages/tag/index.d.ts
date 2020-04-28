import { DocumentNode } from "graphql";

// TODO: subscriptions

type BaseTypedDocument = { document: string; result: any };

type BaseTypedQuery = BaseTypedDocument & {
  type: "query";
  variables: Record<string, any> | undefined;
};

type BaseTypedMutation = BaseTypedDocument & {
  type: "mutation";
  variables: Record<string, any> | undefined;
};

type BaseOperations = BaseTypedQuery | BaseTypedMutation;

type BaseTypedFragment = BaseTypedDocument & {
  type: "fragment";
};

type BaseDocumentTypes = BaseOperations | BaseTypedFragment;

type TypedDocumentNode<TypedDocument extends BaseDocumentTypes> = {
  ___type: TypedDocument;
};

type DocumentResult<
  Node extends TypedDocumentNode<BaseDocumentTypes>
> = Node["___type"]["result"];

type DocumentVariables<
  Node extends TypedDocumentNode<BaseOperations>
> = Node["___type"]["variables"];

interface GqlTag {
  (
    strings: readonly string[],
    ...interpolations: TypedDocumentNode<BaseTypedFragment>[]
  ): <Key extends keyof Documents>(
    name: Key
  ) => TypedDocumentNode<Documents[Key]>;
  ___isTsGqlTag: true;
}

export declare const gql: GqlTag;

export function getDocumentNode(
  node: TypedDocumentNode<BaseDocumentTypes>
): DocumentNode;

export interface Documents {}
