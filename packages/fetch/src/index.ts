import {
  OperationVariables,
  TypedDocumentNode,
  BaseOperations,
  OperationData,
} from "@ts-gql/tag";
import { GraphQLFormattedError } from "graphql/error/GraphQLError";
import { print } from "graphql/language/printer";

export type Fetcher = <
  TTypedDocumentNode extends TypedDocumentNode<BaseOperations>
>(
  operation: TTypedDocumentNode,
  ...variables:
    | [OperationVariables<TTypedDocumentNode>]
    | ({} extends OperationVariables<TTypedDocumentNode> ? [] : never)
) => Promise<OperationData<TTypedDocumentNode>>;

export function createFetcher(url: string): Fetcher {
  return ((operation: any, variables: any) => {
    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: print(operation),
        variables,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.errors?.length) {
          throw new GraphQLErrorResult(data.data, data.errors);
        }
        return data.data;
      });
  }) as any;
}

export class GraphQLErrorResult extends Error {
  errors: readonly GraphQLFormattedError[];
  data: unknown;
  constructor(data: unknown, errors: readonly GraphQLFormattedError[]) {
    super(
      `GraphQL errors occurred:\n${errors.map((e) => e.message).join("\n")})}`
    );
    this.errors = errors;
    this.data = data;
  }
}
