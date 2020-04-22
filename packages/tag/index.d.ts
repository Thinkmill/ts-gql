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
  Node extends
    | TypedDocumentNode<BaseTypedQueryWithRequiredVariables>
    | TypedDocumentNode<BaseTypedMutationWithVariables>
> = Node["___type"]["variables"];

export declare function gql(
  strings: readonly string[],
  ...interpolations: TypedDocumentNode<BaseTypedFragment>[]
): <Key extends keyof Documents>(
  name: Key
) => TypedDocumentNode<Documents[Key]>;

export interface Documents extends Record<string, BaseDocumentTypes> {}
