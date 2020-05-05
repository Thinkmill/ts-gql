---
"@ts-gql/compiler": minor
"@ts-gql/eslint-plugin": minor
"@ts-gql/tag": minor
---

Use new technique to generate types.

This requires you to use `@ts-gql/compiler` and `@ts-gql/babel-plugin` in addition to `@ts-gql/eslint-plugin`.

Configuration also now lives in the `package.json` like this:

```json
{
  "ts-gql": {
    "schema": "schema.graphql"
  }
}
```
