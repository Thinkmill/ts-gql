import {
  TypedDocumentNode,
  BaseTypedQueryWithRequiredVariables,
  DocumentResult,
  DocumentVariables,
  BaseTypedQuery,
  BaseTypedMutationWithRequiredVariables,
  BaseTypedMutation,
} from "@ts-gql/tag";
import {
  QueryHookOptions,
  QueryResult,
  MutationFunctionOptions,
  FetchResult,
  MutationResult,
} from "@apollo/client";

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

type HookMutationFuncOptions<
  TTypedDocumentNode extends TypedDocumentNode<
    BaseTypedMutationWithRequiredVariables | BaseTypedMutation
  >
> = Omit<
  MutationFunctionOptions<
    DocumentResult<TTypedDocumentNode>,
    DocumentVariables<TTypedDocumentNode>
  >,
  "variables"
>;

type MutationTuple<
  TTypedDocumentNode extends TypedDocumentNode<
    BaseTypedMutationWithRequiredVariables | BaseTypedMutation
  >
> = [
  [TTypedDocumentNode] extends [
    TypedDocumentNode<BaseTypedMutationWithRequiredVariables>
  ]
    ? (
        options: HookMutationFuncOptions<TTypedDocumentNode> & {
          variables: DocumentVariables<TTypedDocumentNode>;
        }
      ) => Promise<FetchResult<DocumentResult<TTypedDocumentNode>>>
    : (
        options?: DocumentVariables<TTypedDocumentNode> extends undefined
          ? HookMutationFuncOptions<TTypedDocumentNode>
          : HookMutationFuncOptions<TTypedDocumentNode> & {
              variables?: DocumentVariables<TTypedDocumentNode>;
            }
      ) => Promise<FetchResult<DocumentResult<TTypedDocumentNode>>>,
  MutationResult<DocumentResult<TTypedDocumentNode>>
];

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
  export function useMutation<
    TTypedDocumentNode extends TypedDocumentNode<
      BaseTypedMutationWithRequiredVariables | BaseTypedMutation
    >
  >(mutation: TTypedDocumentNode): MutationTuple<TTypedDocumentNode>;
}
