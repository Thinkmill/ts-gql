import { DocumentNode } from "graphql";

// TODO: subscriptions

type BaseTypedDocument = { document: string; result: any };

type BaseTypedQuery = BaseTypedDocument & {
  type: "query";
  variables?: Record<string, any>;
};

type BaseTypedMutation = BaseTypedDocument & {
  type: "mutation";
  variables?: Record<string, any>;
};

type BaseTypedQueryWithRequiredVariables = BaseTypedDocument & {
  type: "query-with-required-variables";
  variables: Record<string, any>;
};

type BaseTypedMutationWithVariables = BaseTypedDocument & {
  type: "mutation-with-required-variables";
  variables: Record<string, any>;
};

type BaseOperations =
  | BaseTypedQuery
  | BaseTypedMutation
  | BaseTypedQueryWithRequiredVariables
  | BaseTypedMutationWithVariables;

type BaseTypedFragment = BaseTypedDocument & {
  type: "fragment";
};

type BaseDocumentTypes = BaseOperations | BaseTypedFragment;

type TypedDocumentNode<
  TypedDocument extends BaseDocumentTypes
> = DocumentNode & { ___type: TypedDocument };

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

export interface Documents {}
