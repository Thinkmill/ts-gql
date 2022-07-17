---
"@ts-gql/apollo": minor
"@ts-gql/tag": minor
---

`ts-gql`'s `TypedDocumentNode` type is now compatible with [`@graphql-typed-document-node/core`](https://github.com/dotansimha/graphql-typed-document-node)'s `TypedDocumentNode`.

The recommended usage of ts-gql with Apollo Client is now to use `@apollo/client` directly. This also allows ts-gql to be used with urql and any other GraphQL client that supports `@graphql-typed-document-node/core`.

When using `@apollo/client` over `@ts-gql/apollo`, it's important to note that some type safety will be lost:

- Variables are always optional so omitting variables when they are required will no longer be caught by TypeScript
- `refetchQueries` will accept any string so passing names to queries that don't exist will not cause a TypeScript error. You should likely pass in the document with the query itself to avoid mis-typing query names causing errors.

Because `@graphql-typed-document-node/core`'s `TypedDocumentNode` extends `graphql`'s `DocumentNode`, this also means that `getDocumentNode` from `@ts-gql/tag` is no longer necessary. This could be another cause for bugs if there is a different API that accepts a `TypedDocumentNode`, you will longer have to explicitly cast to `DocumentNode` with `getDocumentNode`.

#### Context behind this change

When ts-gql was originally written, `@graphql-typed-document-node/core` did not exist. Since then, `@graphql-typed-document-node/core` has become used by Apollo Client and urql. Given that, maintaining types to adapt Apollo Client to ts-gql's `TypedDocumentNode` seems less sensible. Having to understand the intent behind the entire Apollo Client API and balance that with the desire for type safety is time consuming and means that . Doing that for more GraphQL clients would get even more impractical

While this does mean that some of ts-gql's safety is reduced, this seems like an appropriate trade-off so that ts-gql can reduce maintaince burden, avoid imposing opinions on top of GraphQL clients and support more GraphQL clients without having to write types for them specifically.

The `@ts-gql/apollo` package can still be used and may be updated in the future to avoid breakage if that makes sense but it will no longer be the recommended pattern.
