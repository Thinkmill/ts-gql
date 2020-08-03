# @ts-gql/next

`@ts-gql/next` starts ts-gql's watcher when you start Next.js's dev server. Note that it **does not generate the artifacts when running `next build`**, you should run `ts-gql build` in a script before running `next build`.

## Usage

```js
const { withTsGql } = require("@ts-gql/next");
module.exports = withTsGql({ ...yourOwnConfig });
```
