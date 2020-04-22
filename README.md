# @ts-gql

> Write GraphQL queries in TypeScript and have them be typed with no effort

## Why?

There are lots of great tools(some of which ts-gql use internally!) for generating types from GraphQL Queries though all the solutions I've seen have at least one of two problems

- The writing of a query isn't connected to the type that it returns
- You're forced to write queries in `.graphql` files rather than inline
  - This also often means that you can't use fragments

## How does ts-gql solve it?

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
  "filename": "src/index.ts",
  "start": 50
}
ts-gql-meta-end
*/

declare module "@ts-gql/tag" {
  interface Documents {
    MyQuery: {
      type: "query";
      document: "\n  query MyQuery {\n    hello\n  }\n";
      result: { hello: string };
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
type MyQuery = import("graphql").DocumentNode & {
  ___type: {
    type: "query";
    document: "\n  query MyQuery {\n    hello\n  }\n";
    result: { hello: string };
  };
};
```

You can then use `@ts-graphql/apollo` or `@ts-graphql/gatsby-plugin` to augment the types of GraphQL libraries so that they will type their results and query variables based on your query.

## Getting Started

When using ts-gql, you'll always need `@ts-gql/tag` and `@ts-gql/eslint-plugin`.

```bash
yarn add graphql @ts-gql/tag @ts-gql/eslint-plugin
```

If you're not already using ESLint and `@typescript-eslint/parser`, you'll need those too.

## Using Apollo

```bash
yarn add @ts-graphql/apollo
```

## Using Gatsby

```bash
yarn add @ts-graphql/gatsby-plugin
```

# Future Ideas

- Offer the option to use hashes instead of document names so document names don't have to be unique

# Thanks

- [graphql-code-generator](https://github.com/dotansimha/graphql-code-generator) for the infrastructure to generate TypeScript types from GraphQL queries
- [graphql-let](https://github.com/piglovesyou/graphql-let) for providing a really nice experience
