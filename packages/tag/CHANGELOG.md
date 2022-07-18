# @ts-gql/tag

## 0.7.0

### Minor Changes

- [#98](https://github.com/Thinkmill/ts-gql/pull/98) [`bc8d6eb`](https://github.com/Thinkmill/ts-gql/commit/bc8d6ebbf1021829de24d3c916dad5e0b3ab1edf) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - `ts-gql`'s `TypedDocumentNode` type is now compatible with [`@graphql-typed-document-node/core`](https://github.com/dotansimha/graphql-typed-document-node)'s `TypedDocumentNode`.

  The recommended usage of ts-gql with Apollo Client is now to use `@apollo/client` directly. This also allows ts-gql to be used with urql and any other GraphQL client that supports `@graphql-typed-document-node/core`. The `@ts-gql/apollo` package can still be used and may be updated in the future to avoid breakage if that makes sense but it is no longer the recommended pattern.

  When using `@apollo/client` over `@ts-gql/apollo`, it's important to note that some type safety will be lost:

  - Variables are always optional so omitting variables when they are required will no longer be caught by TypeScript
  - `refetchQueries` will accept any string so passing names to queries that don't exist will not cause a TypeScript error. You should likely pass in the document with the query itself to avoid mis-typing query names causing errors.

  Because `@graphql-typed-document-node/core`'s `TypedDocumentNode` extends `graphql`'s `DocumentNode`, this means that `getDocumentNode` from `@ts-gql/tag` is no longer necessary. This could be another cause for bugs if there are two APIs, one that accepts a `TypedDocumentNode` that you should use and another that accepts `DocumentNode` which you shouldn't use, you could accidentally use the API that accepts `DocumentNode` over the one that accepts `TypedDocumentNode` where previously you would get an error when passing a `TypedDocumentNode` to something accepting a `DocumentNode`.

  #### Context behind this change

  When ts-gql was originally written, `@graphql-typed-document-node/core` did not exist. Since then, `@graphql-typed-document-node/core` has become used by Apollo Client and urql. Given that, maintaining types to adapt Apollo Client to ts-gql's `TypedDocumentNode` seems less sensible.

  While this does mean that some of ts-gql's safety is reduced, this seems like an appropriate trade-off so that ts-gql can reduce maintaince burden, avoid imposing opinions on top of GraphQL clients and support more GraphQL clients without having to write types for them specifically.

## 0.6.1

### Patch Changes

- [`0e3e2f5`](https://github.com/Thinkmill/ts-gql/commit/0e3e2f5004c7e42bbc394664c5e667ce3597e6fd) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Support `graphql@16`

## 0.6.0

### Minor Changes

- [#90](https://github.com/Thinkmill/ts-gql/pull/90) [`dc22e45`](https://github.com/Thinkmill/ts-gql/commit/dc22e457d14c816274037010a627d10bcb30f11d) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Removed unused `Documents` export.

* [#90](https://github.com/Thinkmill/ts-gql/pull/90) [`dc22e45`](https://github.com/Thinkmill/ts-gql/commit/dc22e457d14c816274037010a627d10bcb30f11d) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Added `name` property to `BaseTypedFragment` and `fragments` property to `BaseTypedDocument`

- [#90](https://github.com/Thinkmill/ts-gql/pull/90) [`dc22e45`](https://github.com/Thinkmill/ts-gql/commit/dc22e457d14c816274037010a627d10bcb30f11d) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Added support for `"mode": "no-transform"` and `"mode": "mixed"`. See https://github.com/Thinkmill/ts-gql/blob/main/docs/no-transform.md for more details

* [#90](https://github.com/Thinkmill/ts-gql/pull/90) [`dc22e45`](https://github.com/Thinkmill/ts-gql/commit/dc22e457d14c816274037010a627d10bcb30f11d) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Removed spread parameter from `gql` export to align with the fact that `gql` from the `@ts-gql/tag` entrypoint does not allow interpolations.

## 0.5.3

### Patch Changes

- [`3149ffe`](https://github.com/Thinkmill/ts-gql/commit/3149ffe2ffb428273e80451d8a67873073e052c8) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Support `graphql@^15.0.0`

## 0.5.2

### Patch Changes

- [`ab25d45`](https://github.com/Thinkmill/ts-gql/commit/ab25d45bd80dfe58f878a500c92e0bdb3eef5c86) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Improve error message when `gql` is called at runtime

## 0.5.1

### Patch Changes

- [`89bbe8b`](https://github.com/Thinkmill/ts-gql/commit/89bbe8bbd8c3ed3fd3d42ccb5fb0bfacb0d15575) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fix the type of the `documents` field

## 0.5.0

### Minor Changes

- [`abba421`](https://github.com/Thinkmill/ts-gql/commit/abba4214b10bc878de9c7c9e350e5ef04f3ef11f) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Include all documents on typed document nodes

## 0.4.0

### Minor Changes

- [`b83e180`](https://github.com/Thinkmill/ts-gql/commit/b83e180ea94cd7fb1d66d5c7835f333a5fcf56f5) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Rename some types

## 0.3.0

### Minor Changes

- [`e4c60ad`](https://github.com/Thinkmill/ts-gql/commit/e4c60adcc45abba018c4b9d4d0379e7d529a9af1) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Use new technique to generate types.

  This requires you to use `@ts-gql/compiler` and `@ts-gql/babel-plugin` in addition to `@ts-gql/eslint-plugin`.

  Configuration also now lives in the `package.json` like this:

  ```json
  {
    "ts-gql": {
      "schema": "schema.graphql"
    }
  }
  ```

## 0.2.0

### Minor Changes

- [`8485b1a`](https://github.com/Thinkmill/ts-gql/commit/8485b1a28228feea836d076cc7dd1a0691414248) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Remove -with-required-variables types

## 0.1.0

### Minor Changes

- [`b444283`](https://github.com/Thinkmill/ts-gql/commit/b44428353e6e94f7df60b8ffc409b44b6fbca1ca) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Initial release
