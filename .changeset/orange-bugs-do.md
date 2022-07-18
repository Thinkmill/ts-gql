---
"@ts-gql/apollo": minor
"@ts-gql/tag": minor
---

`ts-gql`'s `TypedDocumentNode` type is now compatible with [`@graphql-typed-document-node/core`](https://github.com/dotansimha/graphql-typed-document-node)'s `TypedDocumentNode`.

The recommended usage of ts-gql with Apollo Client is now to use `@apollo/client` directly. This also allows ts-gql to be used with urql and any other GraphQL client that supports `@graphql-typed-document-node/core`. The `@ts-gql/apollo` package can still be used and may be updated in the future to avoid breakage if that makes sense but it is no longer the recommended pattern.

When using `@apollo/client` over `@ts-gql/apollo`, it's important to note that some type safety will be lost:

- Variables are always optional so omitting variables when they are required will no longer be caught by TypeScript
- `refetchQueries` will accept any string so passing names to queries that don't exist will not cause a TypeScript error. You should likely pass in the document with the query itself to avoid mis-typing query names causing errors.

Because `@graphql-typed-document-node/core`'s `TypedDocumentNode` extends `graphql`'s `DocumentNode`, this means that `getDocumentNode` from `@ts-gql/tag` is no longer necessary. This could be another cause for bugs if there are two APIs, one that accepts a `TypedDocumentNode` that you should use and another that accepts `DocumentNode` which you shouldn't use, you could accidentally use the API that accepts `DocumentNode` over the one that accepts `TypedDocumentNode` where previously you would get an error when passing a `TypedDocumentNode` to something accepting a `DocumentNode`.

#### Context behind this change

When ts-gql was originally written, `@graphql-typed-document-node/core` did not exist. Since then, `@graphql-typed-document-node/core` has become used by Apollo Client and urql. Given that, maintaining types to adapt Apollo Client to ts-gql's `TypedDocumentNode` seems less sensible.

While this does mean that some of ts-gql's safety is reduced, this seems like an appropriate trade-off so that ts-gql can reduce maintaince burden, avoid imposing opinions on top of GraphQL clients and support more GraphQL clients without having to write types for them specifically.
