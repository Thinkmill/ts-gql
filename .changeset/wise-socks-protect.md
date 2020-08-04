---
"@ts-gql/config": minor
---

Change `schema` property of `Config` from having the `GraphQLSchema` to a function that returns the `GraphQLSchema`. This is so that the schema is not unnecessarily parsed when it doesn't need to be
