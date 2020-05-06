# @ts-gql/compiler

## 0.2.1

### Patch Changes

- [`fb9523a`](https://github.com/Thinkmill/ts-gql/commit/fb9523ac73b1a73b379ba8d95d0c87851991d254) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fix a bug

## 0.2.0

### Minor Changes

- [`b83e180`](https://github.com/Thinkmill/ts-gql/commit/b83e180ea94cd7fb1d66d5c7835f333a5fcf56f5) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Require fragments to be named in the format ComponentName_propName

## 0.1.1

### Patch Changes

- [`f095abc`](https://github.com/Thinkmill/ts-gql/commit/f095abcc1d42ab9a9bbd1a1f7ff395eeea4fc650) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Ignore gitignored files when generating types

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

* [`e4c60ad`](https://github.com/Thinkmill/ts-gql/commit/e4c60adcc45abba018c4b9d4d0379e7d529a9af1) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Initial release
