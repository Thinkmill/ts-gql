---
"@ts-gql/compiler": patch
---

Built-in scalars that haven't been overriden in the `scalars` config will now be inlined when generating the schema input types rather than referencing the generated `Scalars` type (which should not be imported outside of ts-gql's generated files).
