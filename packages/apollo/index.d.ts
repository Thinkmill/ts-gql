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
  QueryHookOptions as _QueryHookOptions,
  QueryResult,
  MutationFunctionOptions,
  FetchResult,
  MutationResult,
  FetchPolicy,
  MutationUpdaterFn,
  ErrorPolicy,
  MutationQueryReducersMap,
  ExecutionResult,
  PureQueryOptions,
} from "@apollo/client";

// TODO: Mutations and all the other ways you can call queries and mutations

type QueryHookOptions<
  TTypedDocumentNode extends TypedDocumentNode<
    BaseTypedQueryWithRequiredVariables | BaseTypedQuery
  >
> = Omit<
  _QueryHookOptions<
    DocumentResult<TTypedDocumentNode>,
    DocumentVariables<TTypedDocumentNode>
  >,
  "variables" | "query"
>;

type QueryHookOptionsWithRequiredVariables<
  TTypedDocumentNode extends TypedDocumentNode<
    BaseTypedQueryWithRequiredVariables
  >
> = QueryHookOptions<TTypedDocumentNode> & {
  variables: DocumentVariables<TTypedDocumentNode>;
};

type MutationHookFuncOptions<
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
        options: MutationHookFuncOptions<TTypedDocumentNode> & {
          variables: DocumentVariables<TTypedDocumentNode>;
        }
      ) => Promise<FetchResult<DocumentResult<TTypedDocumentNode>>>
    : (
        options?: DocumentVariables<TTypedDocumentNode> extends undefined
          ? MutationHookFuncOptions<TTypedDocumentNode>
          : MutationHookFuncOptions<TTypedDocumentNode> & {
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
          QueryHookOptionsWithRequiredVariables<TTypedDocumentNode>
        ]
      :
          | [
              TTypedDocumentNode,
              DocumentVariables<TTypedDocumentNode> extends undefined
                ? QueryHookOptions<TTypedDocumentNode>
                : QueryHookOptions<TTypedDocumentNode> & {
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

type RefetchQueryDescription = Array<string | PureQueryOptions>;

export type MutationOptions<
  TTypedDocumentNode extends TypedDocumentNode<
    BaseTypedMutationWithRequiredVariables | BaseTypedMutation
  >
> = {
  mutation: TTypedDocumentNode;
  context?: any;
  fetchPolicy?: FetchPolicy;
  optimisticResponse?:
    | DocumentResult<TTypedDocumentNode>
    | ((
        vars: DocumentVariables<TTypedDocumentNode>
      ) => DocumentResult<TTypedDocumentNode>);
  updateQueries?: MutationQueryReducersMap<DocumentResult<TTypedDocumentNode>>;
  refetchQueries?:
    | ((
        result: ExecutionResult<DocumentResult<TTypedDocumentNode>>
      ) => RefetchQueryDescription)
    | RefetchQueryDescription;
  awaitRefetchQueries?: boolean;
  update?: MutationUpdaterFn<DocumentResult<TTypedDocumentNode>>;
  errorPolicy?: ErrorPolicy;
} & (TTypedDocumentNode extends TypedDocumentNode<
  BaseTypedMutationWithRequiredVariables
>
  ? { variables: DocumentVariables<TTypedDocumentNode> }
  : { variables?: DocumentVariables<TTypedDocumentNode> });

declare module "@apollo/client/ApolloClient" {
  export interface ApolloClient<TCacheShape> {
    // query<T = any, TVariables = OperationVariables>(
    //   options: QueryHookOptions<TVariables>
    // ): Promise<ApolloQueryResult<T>>;
    mutate<
      TTypedDocumentNode extends TypedDocumentNode<
        BaseTypedMutationWithRequiredVariables | BaseTypedMutation
      >
    >(
      options: MutationOptions<TTypedDocumentNode>
    ): Promise<FetchResult<DocumentResult<TTypedDocumentNode>>>;
  }
}
