import {
  TypedDocumentNode,
  BaseTypedQueryWithRequiredVariables,
  DocumentResult,
  DocumentVariables,
  BaseTypedQuery,
} from "@ts-gql/tag";
import { QueryHookOptions, QueryResult } from "@apollo/client";

// TODO: Mutations and all the other ways you can call queries and mutations

declare module "@apollo/client" {
  export function useQuery<
    TTypedDocumentNode extends TypedDocumentNode<
      BaseTypedQueryWithRequiredVariables
    >
  >(
    query: TTypedDocumentNode,
    options: Omit<
      QueryHookOptions<
        DocumentResult<TTypedDocumentNode>,
        DocumentVariables<TTypedDocumentNode>
      >,
      "variables"
    > & { variables: DocumentVariables<TTypedDocumentNode> }
  ): QueryResult<
    DocumentResult<TTypedDocumentNode>,
    DocumentVariables<TTypedDocumentNode>
  >;
  export function useQuery<
    TTypedDocumentNode extends TypedDocumentNode<BaseTypedQuery>
  >(
    query: TTypedDocumentNode,
    options?: Omit<
      QueryHookOptions<DocumentResult<TTypedDocumentNode>, undefined>,
      "variables"
    >
  ): QueryResult<DocumentResult<TTypedDocumentNode>, undefined>;
}
