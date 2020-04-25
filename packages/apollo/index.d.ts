import {
  TypedDocumentNode,
  BaseTypedQueryWithRequiredVariables,
  DocumentResult,
  DocumentVariables,
  BaseTypedQuery,
} from "@ts-gql/tag";
import { QueryHookOptions, QueryResult } from "@apollo/client";

// TODO: Mutations and all the other ways you can call queries and mutations

type QueryOptionsWithRequiredVariables<
  TTypedDocumentNode extends TypedDocumentNode<
    BaseTypedQueryWithRequiredVariables
  >
> = Omit<
  QueryHookOptions<
    DocumentResult<TTypedDocumentNode>,
    DocumentVariables<TTypedDocumentNode>
  >,
  "variables" | "query"
> & { variables: DocumentVariables<TTypedDocumentNode> };

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
              Omit<
                QueryHookOptions<
                  DocumentResult<TTypedDocumentNode>,
                  DocumentVariables<TTypedDocumentNode>
                >,
                "query"
              >
            ]
          | [TTypedDocumentNode]
  ): QueryResult<
    DocumentResult<TTypedDocumentNode>,
    DocumentVariables<TTypedDocumentNode>
  >;
}
