---
"@ts-gql/compiler": minor
---

TypeScript types for object, union and interface types are no longer generated in `__generated__/ts-gql/@schema.d.ts`. These types have an unclear meaning and were not intended to be used. If you relied on these types, you may want to use [GraphQL Code Generator](https://www.the-guild.dev/graphql/codegen) to generate those types for you.
