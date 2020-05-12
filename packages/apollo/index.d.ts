import {
  TypedDocumentNode,
  OperationData,
  OperationVariables,
  BaseTypedQuery,
  BaseTypedMutation,
  BaseOperations,
  AllDocuments,
  BaseDocumentTypes,
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
> = RequiredKeys<OperationVariables<TTypedDocumentNode>> extends never
  ? OptionalResult
  : RequiredResult;

// TODO: Mutations and all the other ways you can call queries and mutations

type QueryHookOptions<
  TTypedDocumentNode extends TypedDocumentNode<BaseTypedQuery>
> = Omit<
  _QueryHookOptions<
    OperationData<TTypedDocumentNode>,
    OperationVariables<TTypedDocumentNode>
  >,
  "variables" | "query"
>;

type QueryHookOptionsWithRequiredVariables<
  TTypedDocumentNode extends TypedDocumentNode<BaseTypedQuery>
> = QueryHookOptions<TTypedDocumentNode> & {
  variables: OperationVariables<TTypedDocumentNode>;
};

type MutationHookFuncOptions<
  TTypedDocumentNode extends TypedDocumentNode<BaseTypedMutation>
> = Omit<
  MutationFunctionOptions<
    OperationData<TTypedDocumentNode>,
    OperationVariables<TTypedDocumentNode>
  >,
  "variables" | "refetchQueries"
> & { refetchQueries?: RefetchQueryDescription<TTypedDocumentNode> };

type MutationTuple<
  TTypedDocumentNode extends TypedDocumentNode<BaseTypedMutation>
> = [
  HasRequiredVariables<
    TTypedDocumentNode,
    (
      options: MutationHookFuncOptions<TTypedDocumentNode> & {
        variables: OperationVariables<TTypedDocumentNode>;
      }
    ) => Promise<FetchResult<OperationData<TTypedDocumentNode>>>,
    (
      options?: OperationVariables<TTypedDocumentNode> extends undefined
        ? MutationHookFuncOptions<TTypedDocumentNode>
        : MutationHookFuncOptions<TTypedDocumentNode> & {
            variables?: OperationVariables<TTypedDocumentNode>;
          }
    ) => Promise<FetchResult<OperationData<TTypedDocumentNode>>>
  >,

  MutationResult<OperationData<TTypedDocumentNode>>
];

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
        OperationVariables<TTypedDocumentNode> extends undefined
          ? QueryHookOptions<TTypedDocumentNode>
          : QueryHookOptions<TTypedDocumentNode> & {
              variables?: OperationVariables<TTypedDocumentNode>;
            }
      ]
    | [TTypedDocumentNode]
  >
): QueryResult<
  OperationData<TTypedDocumentNode>,
  OperationVariables<TTypedDocumentNode>
>;
export function useMutation<
  TTypedDocumentNode extends TypedDocumentNode<BaseTypedMutation>
>(mutation: TTypedDocumentNode): MutationTuple<TTypedDocumentNode>;

type KnownKeysWhichAreQueries<
  T extends Record<string, TypedDocumentNode<BaseDocumentTypes>>
> = {
  [K in keyof T]: string extends K
    ? never
    : number extends K
    ? never
    : T[K] extends TypedDocumentNode<BaseTypedQuery>
    ? K
    : never;
} extends { [_ in keyof T]: infer U }
  ? {} extends U
    ? never
    : U
  : never;

type RefetchQueryDescription<
  TTypedDocumentNode extends TypedDocumentNode<BaseTypedMutation>
> = Array<KnownKeysWhichAreQueries<AllDocuments<TTypedDocumentNode>>>;

export type MutationOptions<
  TTypedDocumentNode extends TypedDocumentNode<BaseTypedMutation>
> = {
  mutation: TTypedDocumentNode;
  context?: any;
  fetchPolicy?: FetchPolicy;
  optimisticResponse?:
    | OperationData<TTypedDocumentNode>
    | ((
        vars: OperationVariables<TTypedDocumentNode>
      ) => OperationData<TTypedDocumentNode>);
  updateQueries?: MutationQueryReducersMap<OperationData<TTypedDocumentNode>>;
  refetchQueries?:
    | ((
        result: ExecutionResult<OperationData<TTypedDocumentNode>>
      ) => RefetchQueryDescription<TTypedDocumentNode>)
    | RefetchQueryDescription<TTypedDocumentNode>;
  awaitRefetchQueries?: boolean;
  update?: MutationUpdaterFn<OperationData<TTypedDocumentNode>>;
  errorPolicy?: ErrorPolicy;
} & HasRequiredVariables<
  TTypedDocumentNode,
  { variables: OperationVariables<TTypedDocumentNode> },
  { variables?: OperationVariables<TTypedDocumentNode> }
>;

declare module "@apollo/client/ApolloClient" {
  export interface ApolloClient<TCacheShape> {
    // query<T = any, TVariables = OperationVariables>(
    //   options: QueryHookOptions<TVariables>
    // ): Promise<ApolloQueryResult<T>>;
    mutate<TTypedDocumentNode extends TypedDocumentNode<BaseTypedMutation>>(
      options: MutationOptions<TTypedDocumentNode>
    ): Promise<FetchResult<OperationData<TTypedDocumentNode>>>;
  }
}
