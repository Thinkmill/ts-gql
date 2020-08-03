# ts-gql

> Write GraphQL queries in TypeScript and generate types effortlessly

## Why?

There are lots of great tools(some of which ts-gql use internally!) for generating TypeScript types from GraphQL Queries though a lot of the solutions have at least one of two problems:

- The writing of a query isn't connected to the type that it results in
- You're forced to write queries in `.graphql` files rather than inline
  - This also often means that you can't use fragments or that there's a new import syntax to learn

### How does ts-gql solve these problems?

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
` as import("../__generated__/ts-gql/MyQuery.ts").type;
```

You'll have the best experience if you have ESLint auto fix on save enabled in your editor.

<details>

<summary>Why do we need to add `as import("__generated__/ts-gql/MyQuery.ts").type`?</summary>

TypeScript doesn't currently type tagged template literals with literal string types so there is no way to get the correct type based on the call so we have to add `as import("__generated__/ts-gql/MyQuery.ts").type` though there are [issues](https://github.com/microsoft/TypeScript/issues/16552) [discussing](https://github.com/microsoft/TypeScript/issues/31422) [it](https://github.com/microsoft/TypeScript/issues/33304) which would remove the need for this.

</details>

What this means is that `myQuery` will be typed as something like this

```tsx
type MyQuery = {
  ___type: {
    type: "query";
    result: { readonly hello: string };
    variables: {};
  };
};
```

You can then use `@ts-gql/apollo` instead of `@apollo/client` so that the result and query variables of your queries and mutations are typed based on the queries.

> `@ts-gql/apollo` only exposes a subset of `@apollo/client`'s functionality. For example, it doesn't expose `useLazyQuery` because we recommend using `useApolloClient().query` instead. If you disagree with some of the decisions that `@ts-gql/apollo` makes, you can use ts-gql but write your own type definitions for Apollo or another GraphQL client.

## Getting Started

When using ts-gql, you'll need `@ts-gql/tag`, `@ts-gql/eslint-plugin` and `@ts-gql/compiler`.

```bash
npm install graphql @ts-gql/tag @ts-gql/eslint-plugin @ts-gql/compiler
```

> If you're not already using [ESLint](https://eslint.org/) and [`@typescript-eslint/parser`](https://github.com/typescript-eslint/typescript-eslint), you'll need those too.

You'll need to add the ESLint plugin to your config and enable the `@ts-gql/ts-gql` rule. Your config might look something like this:

```json
{
  "parser": "@typescript-eslint/parser",
  "plugins": ["@ts-gql"],
  "rules": {
    "@ts-gql/ts-gql": "error"
  }
}
```

You now need to tell ts-gql where your GraphQL SDL file or introspection query result is. To do this, add to your `package.json`. Replace `schema.graphql` with the path to your SDL or introspection query result.

```json
{
  "ts-gql": {
    "schema": "schema.graphql"
  }
}
```

Add a script to your package.json and run it. You should run this in `postinstall` so that the types are generated when install happens.

```json
{
  "scripts": {
    "postinstall": "ts-gql build",
    "ts-gql:build": "ts-gql build",
    "ts-gql:watch": "ts-gql watch"
  }
}
```

You can run `npm run ts-gql:build` to do a single build or `npm run ts-gql:watch` to start watching.

If you're using [Next.js](https://nextjs.org/), you can use `@ts-gql/next` to automatically start ts-gql's watcher when you start Next.js's dev server.

## Using Apollo

> Note: ts-gql works with `@apollo/client`(Apollo client v3)

```bash
npm install @ts-gql/apollo
```

You can now use `useQuery` and etc. from `@ts-gql/apollo` with queries created with `@ts-gql/tag`.

TODO: examples

TODO: explain how to use with Apollo Client v2

## FAQ

### Why not let people interpolate fragments so you don't have to have unique fragment/operation names?

This was the original plan! It's been abandoned though for a couple reasons:

- Build time performance
  - Requiring type checking before you can generate types makes things _much_ slower
    - This is compounded by the fact that you not only have to do type checking but you have to do type checking n times where n is the maximum fragment depth. Because we want to encourage the use of fragments, a tool that gets significantly slower as you use more fragments would make it impractical to use fragments
- Having to either not have Prettier work for documents with fragment interpolations(because Prettier will not format interpolations in GraphQL documents unless they are outside of the content of the document so you couldn't interpolate a fragment where it's used) or still have to name it and there(unless you added a syntax for renaming fragments at which point, I would say that that's way more complexity)
- Not allowing interpolation makes it very very clear what you can and can't do. Even if we allowed interpolations, they would be constrained which is a very difficult thing to explain.
- Apollo already doesn't allow non-unique names anyway for their tooling anyway
- TODO: there are more reasons

### This seems a lot like Relay, why not just use Relay?

You're right! There are a lot of similarities between Relay and ts-gql. There are some important differences though. Relay is an entire GraphQL client, it can do a lot of cool things because of that but that also means that if you want the things that the Relay compiler offers, you have to use Relay which may not appeal to everyone. If Relay does work well for you though, that's fine too, use it!

ts-gql isn't trying to be a GraphQL client, it's only trying to type GraphQL queries. While we only ship `@ts-gql/apollo`, there's no reason you couldn't write type definitions for other GraphQL clients.

## Non-Goals

- Improve the experience of creating GraphQL APIs, [Nexus](https://www.nexusjs.org/) does a really great job of this

## Thanks

- [graphql-code-generator](https://github.com/dotansimha/graphql-code-generator) for the infrastructure to generate TypeScript types from GraphQL queries
- [graphql-let](https://github.com/piglovesyou/graphql-let) for providing a really nice experience
- [Relay](https://github.com/facebook/relay) for their approach with fragments
