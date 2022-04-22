# @ts-gql/fetch

> A small wrapper over `fetch` to call GraphQL APIs with ts-gql's type-safety.

```tsx
import { createFetcher, GraphQLErrorResult, Fetcher } from "@ts-gql/fetch";
import { gql } from "@ts-gql/tag"
// or
import { gql } from "@ts-gql/tag/no-transform"

const fetchGraphQL = createFetcher("https://some-graphql-api");

const someQueryOrMutation = gql`...` as import(...).type;

const result = await fetchGraphQL();
```

If any GraphQL errors are returned, an instance of `GraphQLErrorResult` is thrown which has the `data` and `errors` on it.

If you want to change how the fetching occurs but keep the types, you can re-use the `Fetcher` type and write your own implementation like this:

```ts
import { GraphQLErrorResult, Fetcher } from "@ts-gql/fetch";
import { DocumentNode, print } from "graphql";

const fetchGraphQL: Fetcher = ((
  operation: DocumentNode,
  variables?: Record<string, unknown>
) => {
  return fetch("https://some-graphql-api", {
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
```

When using `@ts-gql/fetch`, make sure to set `"addTypename": false` to your ts-gql config so that the generated types only include `__typename` in the returned fields if explicitly requested since `@ts-gql/fetch` won't implicitly add `__typename` like some other GraphQL clients.
