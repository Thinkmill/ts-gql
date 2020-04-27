# ts-gql

> Write GraphQL queries in TypeScript and have them be typed with no effort

## Why?

There are lots of great tools(some of which ts-gql use internally!) for generating types from GraphQL Queries though a lot of the solutions have at least one of two problems

- The writing of a query isn't connected to the type that it returns
- You're forced to write queries in `.graphql` files rather than inline
  - This also often means that you can't use fragments or that there's a new import syntax to learn

## How does ts-gql solve these problems?

When using ts-gql, you write GraphQL queries with a tagged template literal like normal.

```tsx
import { gql } from "@ts-gql/tag";

let myQuery = gql`
  query MyQuery {
    hello
  }
`;
```

And then our ESLint plugin will auto-fix it to

```tsx
import { gql } from "@ts-gql/tag";

let myQuery = gql`
  query MyQuery {
    hello
  }
`("MyQuery");
```

It will also generate a file at `__generated__/ts-gql/MyQuery.d.ts`

```tsx
/*
ts-gql-meta-begin
{
  "hash": "1b2c07ec819c249efde9717f714dcac4",
  "filename": "../../pages/index.tsx",
  "partial": "query MyQuery"
}
ts-gql-meta-end
*/

import * as SchemaTypes from "./@schema";

type MyQueryQueryVariables = {};

type MyQueryQuery = { readonly __typename: "Query" } & Pick<
  SchemaTypes.Query,
  "hello"
>;

declare module "@ts-gql/tag" {
  interface Documents {
    MyQuery: {
      document: "\n  query MyQuery {\n    hello\n  }\n\n";
      type: "query";
      result: MyQueryQuery;
      variables: undefined;
    };
  }
}
```

You'll have the best experience if you have ESLint auto fix on save enabled in your editor.

<details>

<summary>Why do we need to add `("MyQuery")`?</summary>

TypeScript doesn't currently type tagged template literals with literal string types so we have to add `("MyQuery")` though there are [issues](https://github.com/microsoft/TypeScript/issues/16552) [discussing](https://github.com/microsoft/TypeScript/issues/31422) [it](https://github.com/microsoft/TypeScript/issues/33304) which would remove the need for this.

</details>

What this means is that behind the scenes `myQuery` will be typed as

```tsx
type MyQuery = {
  ___type: {
    type: "query";
    document: "\n  query MyQuery {\n    hello\n  }\n";
    result: { hello: string };
  };
};
```

You can then use `@ts-gql/apollo` or `@ts-gql/urql` to augment the types of GraphQL libraries so that they will type their results and query variables based on your query.

## Getting Started

When using ts-gql, you'll always need `@ts-gql/tag` and `@ts-gql/eslint-plugin`.

```bash
yarn add graphql @ts-gql/tag @ts-gql/eslint-plugin
```

If you're not already using ESLint and `@typescript-eslint/parser`, you'll need those too.

## Using Apollo

```bash
yarn add @ts-gql/apollo
```

## Using urql

```bash
yarn add @ts-gql/urql
```

# TODOs

- Offer the option to use hashes instead of document names so document names don't have to be unique
- Autofix not specifying a variable in an operation
- A Babel plugin/some kind of build time transform that performs optimisations like the Relay Compiler does
  - This should be relatively easy since every operation must be entirely static since the only kind of interpolations allowed will be fragment interpolations and we'll know the contents of the fragment because it's encoded in the type.]
- Fix types being out of date in editors so types can't be generated for operations with fragments

## Non-Goals

- Improve the experience of creating GraphQL APIs, [Nexus](https://www.nexusjs.org/) does a really great job of this

# Thanks

- [graphql-code-generator](https://github.com/dotansimha/graphql-code-generator) for the infrastructure to generate TypeScript types from GraphQL queries
- [graphql-let](https://github.com/piglovesyou/graphql-let) for providing a really nice experience
