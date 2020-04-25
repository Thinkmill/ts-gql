import {
  TypedDocumentNode,
  BaseTypedQueryWithRequiredVariables,
  DocumentResult,
  DocumentVariables,
  BaseTypedQuery,
} from "@ts-gql/tag";
import { QueryHookOptions, QueryResult } from "@apollo/client";

// TODO: Mutations and all the other ways you can call queries and mutations

type QueryOptions<
  TTypedDocumentNode extends TypedDocumentNode<
    BaseTypedQueryWithRequiredVariables | BaseTypedQuery
  >
> = Omit<
  QueryHookOptions<
    DocumentResult<TTypedDocumentNode>,
    DocumentVariables<TTypedDocumentNode>
  >,
  "variables" | "query"
>;

type QueryOptionsWithRequiredVariables<
  TTypedDocumentNode extends TypedDocumentNode<
    BaseTypedQueryWithRequiredVariables
  >
> = QueryOptions<TTypedDocumentNode> & {
  variables: DocumentVariables<TTypedDocumentNode>;
};

declare module "@apollo/client" {
  export function useQuery<
    TTypedDocumentNode extends TypedDocumentNode<
      BaseTypedQueryWithRequiredVariables | BaseTypedQuery
    >
  >(
    ...args: [TTypedDocumentNode] extends [
      TypedDocumentNode<BaseTypedQueryWithRequiredVariables>
    ]
      ? [
          TTypedDocumentNode,
          QueryOptionsWithRequiredVariables<TTypedDocumentNode>
        ]
      :
          | [
              TTypedDocumentNode,
              DocumentVariables<TTypedDocumentNode> extends undefined
                ? QueryOptions<TTypedDocumentNode>
                : QueryOptions<TTypedDocumentNode> & {
                    variables?: DocumentVariables<TTypedDocumentNode>;
                  }
            ]
          | [TTypedDocumentNode]
  ): QueryResult<
    DocumentResult<TTypedDocumentNode>,
    DocumentVariables<TTypedDocumentNode>
  >;
}
