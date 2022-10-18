---
"@ts-gql/compiler": minor
---

The correct types are now generated to account for [list input coercion](https://spec.graphql.org/October2021/#sec-List.Input-Coercion) in input object types(the correct types were already generated for variables) so for example, given an input object like:

```graphql
input SomeInput {
  ids: [ID!]!
}
```

The generated TypeScript type will now be equivelent to this:

```ts
export type SomeInput = {
  ids: string | string[];
};
```

instead of what it was previously:

```ts
export type SomeInput = {
  ids: string[];
};
```
