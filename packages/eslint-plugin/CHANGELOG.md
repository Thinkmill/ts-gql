# @ts-gql/eslint-plugin

## 0.5.0

### Minor Changes

- [`4f18b26`](https://github.com/Thinkmill/ts-gql/commit/4f18b264c0b3f6cb754b327b70ef47894f387492) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Determine whether a given gql tag is a ts-gql gql tag by the import rather than the TypeScript type to improve the ESLint plugin's performance and remove the dependency on the TypeScript compiler

## 0.4.5

### Patch Changes

- Updated dependencies [[`fba7341`](https://github.com/Thinkmill/ts-gql/commit/fba7341a1418e0a9d555172dc5c6e86899fa6ed3)]:
  - @ts-gql/config@0.5.0

## 0.4.4

### Patch Changes

- Updated dependencies [[`4be8faa`](https://github.com/Thinkmill/ts-gql/commit/4be8faafa0fba17efa491a0aec8ddbb472aa5572)]:
  - @ts-gql/config@0.4.0

## 0.4.3

### Patch Changes

- Updated dependencies [[`d798897`](https://github.com/Thinkmill/ts-gql/commit/d7988972e801c41bb96aaa4dec5763ebae73e30e)]:
  - @ts-gql/config@0.3.0

## 0.4.2

### Patch Changes

- Updated dependencies [[`caa1974`](https://github.com/Thinkmill/ts-gql/commit/caa19743de1aa1345795691b8d4eea58c052fc8f)]:
  - @ts-gql/config@0.2.0

## 0.4.1

### Patch Changes

- [`e42383b`](https://github.com/Thinkmill/ts-gql/commit/e42383b5970a554462384f9851aabc173f7fcf52) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Use `@ts-gql/config` package

- Updated dependencies [[`e42383b`](https://github.com/Thinkmill/ts-gql/commit/e42383b5970a554462384f9851aabc173f7fcf52)]:
  - @ts-gql/config@0.1.0

## 0.4.0

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

## 0.3.1

### Patch Changes

- [`756f672`](https://github.com/Thinkmill/ts-gql/commit/756f67221ce5bf44a7a949779df8413712eed7ab) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Improve fragment type not found error

## 0.3.0

### Minor Changes

- [`8175079`](https://github.com/Thinkmill/ts-gql/commit/817507911de80cb628e01f42d1c547915f811415) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Represent enums as types rather than TS enums and add scalars option

## 0.2.0

### Minor Changes

- [`8485b1a`](https://github.com/Thinkmill/ts-gql/commit/8485b1a28228feea836d076cc7dd1a0691414248) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Remove -with-required-variables types

## 0.1.0

### Minor Changes

- [`b444283`](https://github.com/Thinkmill/ts-gql/commit/b44428353e6e94f7df60b8ffc409b44b6fbca1ca) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Initial release
