import {
  TypedDocumentNode,
  OperationData,
  OperationVariables,
  BaseTypedQuery,
  BaseTypedMutation,
  BaseOperations,
  AllDocuments,
  BaseTypedFragment,
  FragmentData,
  BaseDocumentTypes,
} from "@ts-gql/tag";
import {
  QueryHookOptions as _QueryHookOptions,
  QueryResult,
  MutationFunctionOptions,
  MutationResult,
  FetchPolicy,
  ErrorPolicy,
  MutationQueryReducersMap,
  ApolloClient,
  Reference,
  ApolloCache,
  BaseMutationOptions,
} from "@apollo/client";
import { ExecutionResult } from "graphql";

type FetchResult<
  TData = {
    [key: string]: any;
  },
  C = Record<string, any>,
  E = Record<string, any>
> = ExecutionResult<TData> & {
  extensions?: E;
  context?: C;
};

export type HasRequiredVariables<
  TTypedDocumentNode extends TypedDocumentNode<BaseOperations>,
  RequiredResult,
  OptionalResult
> = {} extends OperationVariables<TTypedDocumentNode>
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
  "variables" | "query" | "onCompleted" | "onError"
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
  "variables" | "refetchQueries" | "update"
> & {
  refetchQueries?: RefetchQueryDescription<TTypedDocumentNode>;
  update?: MutationUpdaterFn<OperationData<TTypedDocumentNode>>;
};

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
>(
  mutation: TTypedDocumentNode,
  options?: Omit<
    BaseMutationOptions<
      OperationData<TTypedDocumentNode>,
      OperationVariables<TTypedDocumentNode>
    >,
    "variables"
  >
): MutationTuple<TTypedDocumentNode>;

type KnownKeysWhichAreQueries<
  T extends Record<string, TypedDocumentNode<BaseDocumentTypes>>
> = Values<{
  [K in keyof T as string extends K
    ? never
    : number extends K
    ? never
    : K]: T[K] extends TypedDocumentNode<BaseTypedQuery> ? K : never;
}>;

type Values<T> = T[keyof T];

type RefetchQueryDescription<
  TTypedDocumentNode extends TypedDocumentNode<BaseTypedMutation>
> = Array<KnownKeysWhichAreQueries<AllDocuments<TTypedDocumentNode>>>;

export type MutationOptions<
  TTypedDocumentNode extends TypedDocumentNode<BaseTypedMutation>
> = {
  mutation: TTypedDocumentNode;
  context?: Record<string, any>;
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

type QueryFnOptions<
  TTypedDocumentNode extends TypedDocumentNode<BaseTypedQuery>
> = {
  query: TTypedDocumentNode;
  errorPolicy?: ErrorPolicy;
  fetchPolicy?: FetchPolicy;
  context?: Record<string, any>;
} & HasRequiredVariables<
  TTypedDocumentNode,
  { variables: OperationVariables<TTypedDocumentNode> },
  { variables?: OperationVariables<TTypedDocumentNode> }
>;

export function useApolloClient(): Omit<
  ApolloClient<object>,
  | "mutate"
  | "query"
  | "writeQuery"
  | "readQuery"
  | "writeFragment"
  | "readFragment"
> & {
  query<TTypedDocumentNode extends TypedDocumentNode<BaseTypedQuery>>(
    options: QueryFnOptions<TTypedDocumentNode>
  ): Promise<FetchResult<OperationData<TTypedDocumentNode>>>;
  mutate<TTypedDocumentNode extends TypedDocumentNode<BaseTypedMutation>>(
    options: MutationOptions<TTypedDocumentNode>
  ): Promise<FetchResult<OperationData<TTypedDocumentNode>>>;
} & CacheReadersAndUpdaters;

type FragmentCacheUpdateOptions<
  TTypedDocumentNode extends TypedDocumentNode<BaseTypedFragment>,
  TVariables
> = {
  id?: string;
  fragment: TTypedDocumentNode;
  fragmentName?: string;
  variables?: TVariables;
};

type QueryCacheUpdateOptions<
  TTypedDocumentNode extends TypedDocumentNode<BaseTypedQuery>
> = {
  query: TTypedDocumentNode;
  id?: string;
} & HasRequiredVariables<
  TTypedDocumentNode,
  { variables: OperationVariables<TTypedDocumentNode> },
  { variables?: OperationVariables<TTypedDocumentNode> }
>;

type TSGQLApolloCache<TSerialized> = Omit<
  ApolloCache<TSerialized>,
  "writeQuery" | "readQuery" | "writeFragment" | "readFragment"
> &
  CacheReadersAndUpdaters;

type MutationUpdaterFn<Result> = (
  cache: TSGQLApolloCache<Result>,
  mutationResult: FetchResult<Result>
) => void;

type CacheReadersAndUpdaters = {
  readQuery<TTypedDocumentNode extends TypedDocumentNode<BaseTypedQuery>>(
    options: QueryCacheUpdateOptions<TTypedDocumentNode>,
    optimistic?: boolean
  ): OperationData<TTypedDocumentNode> | null;
  readFragment<
    TTypedDocumentNode extends TypedDocumentNode<BaseTypedFragment>,
    TVariables = any
  >(
    options: FragmentCacheUpdateOptions<TTypedDocumentNode, TVariables>,
    optimistic?: boolean
  ): FragmentData<TTypedDocumentNode> | null;
  writeQuery<TTypedDocumentNode extends TypedDocumentNode<BaseTypedQuery>>(
    options: QueryCacheUpdateOptions<TTypedDocumentNode> & {
      data: OperationData<TTypedDocumentNode>;
      broadcast?: boolean;
    }
  ): Reference | undefined;
  writeFragment<
    TTypedDocumentNode extends TypedDocumentNode<BaseTypedFragment>,
    TVariables = any
  >(
    options: FragmentCacheUpdateOptions<TTypedDocumentNode, TVariables> & {
      data: FragmentData<TTypedDocumentNode>;
      broadcast?: boolean;
    }
  ): Reference | undefined;
};
