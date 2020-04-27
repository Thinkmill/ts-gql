import {
  TypedDocumentNode,
  BaseTypedQueryWithRequiredVariables,
  DocumentResult,
  DocumentVariables,
  BaseTypedQuery,
  BaseTypedMutationWithRequiredVariables,
  BaseTypedMutation,
} from "@ts-gql/tag";
import { OperationContext, RequestPolicy, OperationResult } from "urql/core";
import { UseQueryResponse, UseMutationState } from "urql";

type UseQueryArgs<
  TTypedDocumentNode extends TypedDocumentNode<
    BaseTypedQuery | BaseTypedQueryWithRequiredVariables
  >
> = {
  query: TTypedDocumentNode;
  requestPolicy?: RequestPolicy;
  pollInterval?: number;
  context?: Partial<OperationContext>;
  pause?: boolean;
} & (TTypedDocumentNode extends TypedDocumentNode<
  BaseTypedQueryWithRequiredVariables
>
  ? { variables: DocumentVariables<TTypedDocumentNode> }
  : { variables?: DocumentVariables<TTypedDocumentNode> });

export declare type UseMutationResponse<
  TTypedDocumentNode extends TypedDocumentNode<
    BaseTypedMutation | BaseTypedMutationWithRequiredVariables
  >
> = [
  UseMutationState<DocumentResult<TTypedDocumentNode>>,
  TTypedDocumentNode extends TypedDocumentNode<
    BaseTypedMutationWithRequiredVariables
  >
    ? (
        variables: DocumentVariables<TTypedDocumentNode>,
        context?: Partial<OperationContext>
      ) => Promise<OperationResult<DocumentResult<TTypedDocumentNode>>>
    : (
        variables?: DocumentVariables<TTypedDocumentNode>,
        context?: Partial<OperationContext>
      ) => Promise<OperationResult<DocumentResult<TTypedDocumentNode>>>
];

declare module "urql" {
  export const useQuery: <TTypedDocumentNode extends TypedDocumentNode<
    BaseTypedQuery | BaseTypedQueryWithRequiredVariables
  >>(
    args: UseQueryArgs<TTypedDocumentNode>
  ) => UseQueryResponse<DocumentResult<TTypedDocumentNode>>;
  export const useMutation: <TTypedDocumentNode extends TypedDocumentNode<
    BaseTypedMutation | BaseTypedMutationWithRequiredVariables
  >>(
    mutation: TTypedDocumentNode
  ) => UseMutationResponse<TTypedDocumentNode>;
}
