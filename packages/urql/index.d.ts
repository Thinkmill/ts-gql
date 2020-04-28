import {
  TypedDocumentNode,
  DocumentResult,
  DocumentVariables,
  BaseTypedQuery,
  BaseTypedMutation,
  BaseOperations,
} from "@ts-gql/tag";
import { OperationContext, RequestPolicy, OperationResult } from "urql/core";
import { UseQueryResponse, UseMutationState } from "urql";

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

type UseQueryArgs<
  TTypedDocumentNode extends TypedDocumentNode<BaseTypedQuery>
> = {
  query: TTypedDocumentNode;
  requestPolicy?: RequestPolicy;
  pollInterval?: number;
  context?: Partial<OperationContext>;
  pause?: boolean;
} & HasRequiredVariables<
  TTypedDocumentNode,
  { variables: DocumentVariables<TTypedDocumentNode> },
  { variables?: DocumentVariables<TTypedDocumentNode> }
>;

export declare type UseMutationResponse<
  TTypedDocumentNode extends TypedDocumentNode<BaseTypedMutation>
> = [
  UseMutationState<DocumentResult<TTypedDocumentNode>>,
  HasRequiredVariables<
    TTypedDocumentNode,
    (
      variables: DocumentVariables<TTypedDocumentNode>,
      context?: Partial<OperationContext>
    ) => Promise<OperationResult<DocumentResult<TTypedDocumentNode>>>,
    (
      variables?: DocumentVariables<TTypedDocumentNode>,
      context?: Partial<OperationContext>
    ) => Promise<OperationResult<DocumentResult<TTypedDocumentNode>>>
  >
];

declare module "urql" {
  export const useQuery: <TTypedDocumentNode extends TypedDocumentNode<
    BaseTypedQuery
  >>(
    args: UseQueryArgs<TTypedDocumentNode>
  ) => UseQueryResponse<DocumentResult<TTypedDocumentNode>>;
  export const useMutation: <TTypedDocumentNode extends TypedDocumentNode<
    BaseTypedMutation
  >>(
    mutation: TTypedDocumentNode
  ) => UseMutationResponse<TTypedDocumentNode>;
}
