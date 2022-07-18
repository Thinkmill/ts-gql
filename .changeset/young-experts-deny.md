---
"@ts-gql/compiler": patch
---

When an operation has no variables, the variables type will now be `{}` instead of `{ [key: string]: never }`. The `{ [key: string]: never }` type attempts to describe an object with no properties but it means that a `TypedDocumentNode` with no variables won't be alllowed to be passed to something expecting a `TypedDocumentNode` with the variables of `{ [key: string]: any }`
