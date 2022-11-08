/**
 * We're using [@ts-gql/fetch](https://github.com/Thinkmill/ts-gql/tree/main/packages/fetch)
 * here, but you can use any GraphQL client that supports [@graphql-typed-document-node/core](https://github.com/dotansimha/graphql-typed-document-node).
 */

import { createFetcher } from "@ts-gql/fetch";

export const fetchGraphQL = createFetcher(process.env.GRAPHQL_API_URL!);
