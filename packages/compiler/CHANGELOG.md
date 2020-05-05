# @ts-gql/compiler

## 0.1.0
### Minor Changes



- [`e4c60ad`](https://github.com/Thinkmill/ts-gql/commit/e4c60adcc45abba018c4b9d4d0379e7d529a9af1) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Use new technique to generate types.
  
  This requires you to use `@ts-gql/compiler` and `@ts-gql/babel-plugin` in addition to `@ts-gql/eslint-plugin`.
  
  Configuration also now lives in the `package.json` like this:
  
  ```json
  {
    "ts-gql": {
      "schema": "schema.graphql"
    }
  }
  ```


- [`e4c60ad`](https://github.com/Thinkmill/ts-gql/commit/e4c60adcc45abba018c4b9d4d0379e7d529a9af1) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Initial release
