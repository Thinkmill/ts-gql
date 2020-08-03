# @ts-gql/tag

## 0.5.2

### Patch Changes

- [`ab25d45`](https://github.com/Thinkmill/ts-gql/commit/ab25d45bd80dfe58f878a500c92e0bdb3eef5c86) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Improve error message when `gql` is called at runtime

## 0.5.1

### Patch Changes

- [`89bbe8b`](https://github.com/Thinkmill/ts-gql/commit/89bbe8bbd8c3ed3fd3d42ccb5fb0bfacb0d15575) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fix the type of the `documents` field

## 0.5.0

### Minor Changes

- [`abba421`](https://github.com/Thinkmill/ts-gql/commit/abba4214b10bc878de9c7c9e350e5ef04f3ef11f) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Include all documents on typed document nodes

## 0.4.0

### Minor Changes

- [`b83e180`](https://github.com/Thinkmill/ts-gql/commit/b83e180ea94cd7fb1d66d5c7835f333a5fcf56f5) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Rename some types

## 0.3.0

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

## 0.2.0

### Minor Changes

- [`8485b1a`](https://github.com/Thinkmill/ts-gql/commit/8485b1a28228feea836d076cc7dd1a0691414248) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Remove -with-required-variables types

## 0.1.0

### Minor Changes

- [`b444283`](https://github.com/Thinkmill/ts-gql/commit/b44428353e6e94f7df60b8ffc409b44b6fbca1ca) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Initial release
