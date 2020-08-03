---
"@ts-gql/next": major
---

Remove automatic insertion of `@ts-gql/babel-plugin`, you should include it yourself. Automatically including the babel plugin caused confusion when the code would run with Next but would not run when using another tool like Jest or etc..
