---
"@ts-gql/compiler": patch
---

Inline fragments before generating types so that arrays are never intersected in the generated types because intersecting arrays doesn't do what you want in TypeScript.
