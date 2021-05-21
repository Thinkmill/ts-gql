---
"@ts-gql/schema": patch
---

Added checks to types.field and types.arg which throw if a type isn't passed so that it's easier to see why a type wasn't passed rather than getting an error when mapping the fields to graphql-js arguments
