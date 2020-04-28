import {
  TypedDocumentNode,
  DocumentResult,
  DocumentVariables,
  BaseTypedQuery,
  BaseTypedMutation,
  BaseOperations,
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

export type RequiredKeys<T> = {
  [K in keyof T]: {} extends Pick<T, K> ? never : K;
} extends { [_ in keyof T]: infer U }
  ? {} extends U
    ? never
    : U
  : never;

export type HasRequiredVariables<
  TTypedDocumentNode extends TypedDocumentNode<BaseOperations>,
  RequiredResult,
  OptionalResult
> = RequiredKeys<DocumentVariables<TTypedDocumentNode>> extends never
  ? OptionalResult
  : RequiredResult;

// TODO: Mutations and all the other ways you can call queries and mutations

type QueryHookOptions<
  TTypedDocumentNode extends TypedDocumentNode<BaseTypedQuery>
> = Omit<
  _QueryHookOptions<
    DocumentResult<TTypedDocumentNode>,
    DocumentVariables<TTypedDocumentNode>
  >,
  "variables" | "query"
>;

type QueryHookOptionsWithRequiredVariables<
  TTypedDocumentNode extends TypedDocumentNode<BaseTypedQuery>
> = QueryHookOptions<TTypedDocumentNode> & {
  variables: DocumentVariables<TTypedDocumentNode>;
};

type MutationHookFuncOptions<
  TTypedDocumentNode extends TypedDocumentNode<BaseTypedMutation>
> = Omit<
  MutationFunctionOptions<
    DocumentResult<TTypedDocumentNode>,
    DocumentVariables<TTypedDocumentNode>
  >,
  "variables"
>;

type MutationTuple<
  TTypedDocumentNode extends TypedDocumentNode<BaseTypedMutation>
> = [
  HasRequiredVariables<
    TTypedDocumentNode,
    (
      options: MutationHookFuncOptions<TTypedDocumentNode> & {
        variables: DocumentVariables<TTypedDocumentNode>;
      }
    ) => Promise<FetchResult<DocumentResult<TTypedDocumentNode>>>,
    (
      options?: DocumentVariables<TTypedDocumentNode> extends undefined
        ? MutationHookFuncOptions<TTypedDocumentNode>
        : MutationHookFuncOptions<TTypedDocumentNode> & {
            variables?: DocumentVariables<TTypedDocumentNode>;
          }
    ) => Promise<FetchResult<DocumentResult<TTypedDocumentNode>>>
  >,

  MutationResult<DocumentResult<TTypedDocumentNode>>
];

declare module "@apollo/client" {
  export function useQuery<
    TTypedDocumentNode extends TypedDocumentNode<BaseTypedQuery>
  >(
    ...args: HasRequiredVariables<
      TTypedDocumentNode,
      [
        TTypedDocumentNode,
        QueryHookOptionsWithRequiredVariables<TTypedDocumentNode>
      ],
      | [
          TTypedDocumentNode,
          DocumentVariables<TTypedDocumentNode> extends undefined
            ? QueryHookOptions<TTypedDocumentNode>
            : QueryHookOptions<TTypedDocumentNode> & {
                variables?: DocumentVariables<TTypedDocumentNode>;
              }
        ]
      | [TTypedDocumentNode]
    >
  ): QueryResult<
    DocumentResult<TTypedDocumentNode>,
    DocumentVariables<TTypedDocumentNode>
  >;
  export function useMutation<
    TTypedDocumentNode extends TypedDocumentNode<BaseTypedMutation>
  >(mutation: TTypedDocumentNode): MutationTuple<TTypedDocumentNode>;
}

type RefetchQueryDescription = Array<string | PureQueryOptions>;

export type MutationOptions<
  TTypedDocumentNode extends TypedDocumentNode<BaseTypedMutation>
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
} & HasRequiredVariables<
  TTypedDocumentNode,
  { variables: DocumentVariables<TTypedDocumentNode> },
  { variables?: DocumentVariables<TTypedDocumentNode> }
>;

declare module "@apollo/client/ApolloClient" {
  export interface ApolloClient<TCacheShape> {
    // query<T = any, TVariables = OperationVariables>(
    //   options: QueryHookOptions<TVariables>
    // ): Promise<ApolloQueryResult<T>>;
    mutate<TTypedDocumentNode extends TypedDocumentNode<BaseTypedMutation>>(
      options: MutationOptions<TTypedDocumentNode>
    ): Promise<FetchResult<DocumentResult<TTypedDocumentNode>>>;
  }
}
