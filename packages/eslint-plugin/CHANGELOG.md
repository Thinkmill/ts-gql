# @ts-gql/eslint-plugin

## 0.8.4

### Patch Changes

- [#100](https://github.com/Thinkmill/ts-gql/pull/100) [`63d269d`](https://github.com/Thinkmill/ts-gql/commit/63d269d441420dca5c4c934ec1c60b35831286a2) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed incorrect fix/error for casts on `gql` calls in source files in the same directory as the config.

## 0.8.3

### Patch Changes

- [#96](https://github.com/Thinkmill/ts-gql/pull/96) [`1cecb2c`](https://github.com/Thinkmill/ts-gql/commit/1cecb2cd0c4c38f6da6d8f4914da5f81bef741f5) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed an internal error occurring when writing a selection set on a union type wrapped in a non-null or list type.

## 0.8.2

### Patch Changes

- [`5b800e7`](https://github.com/Thinkmill/ts-gql/commit/5b800e763cb428c972ff0bfb85592405bb513754) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Republish after broken release

## 0.8.1

### Patch Changes

- [`0e3e2f5`](https://github.com/Thinkmill/ts-gql/commit/0e3e2f5004c7e42bbc394664c5e667ce3597e6fd) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Support `graphql@16`

- Updated dependencies [[`0e3e2f5`](https://github.com/Thinkmill/ts-gql/commit/0e3e2f5004c7e42bbc394664c5e667ce3597e6fd)]:
  - @ts-gql/config@0.9.1

## 0.8.0

### Minor Changes

- [#90](https://github.com/Thinkmill/ts-gql/pull/90) [`dc22e45`](https://github.com/Thinkmill/ts-gql/commit/dc22e457d14c816274037010a627d10bcb30f11d) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Added support for `"mode": "no-transform"` and `"mode": "mixed"`. See https://github.com/Thinkmill/ts-gql/blob/main/docs/no-transform.md for more details

### Patch Changes

- Updated dependencies [[`dc22e45`](https://github.com/Thinkmill/ts-gql/commit/dc22e457d14c816274037010a627d10bcb30f11d)]:
  - @ts-gql/config@0.9.0

## 0.7.2

### Patch Changes

- [`3149ffe`](https://github.com/Thinkmill/ts-gql/commit/3149ffe2ffb428273e80451d8a67873073e052c8) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Support `graphql@^15.0.0`

- Updated dependencies [[`603c9ed`](https://github.com/Thinkmill/ts-gql/commit/603c9ed186377c8de4517a8371aec08b45a3a425), [`3149ffe`](https://github.com/Thinkmill/ts-gql/commit/3149ffe2ffb428273e80451d8a67873073e052c8)]:
  - @ts-gql/config@0.8.0

## 0.7.1

### Patch Changes

- Updated dependencies [[`4e88d55`](https://github.com/Thinkmill/ts-gql/commit/4e88d551463c108fe30a609c24fa641e8f9ec88b), [`71f257e`](https://github.com/Thinkmill/ts-gql/commit/71f257e5ec9152b01bcb86aa06810a8d84e1441d)]:
  - @ts-gql/config@0.7.0

## 0.7.0

### Minor Changes

- [`d4a220a`](https://github.com/Thinkmill/ts-gql/commit/d4a220ad74a7e57bafcd2c3ec3b22cafabbfe744) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Add autofix for undefined variables

### Patch Changes

- Updated dependencies [[`d6d5594`](https://github.com/Thinkmill/ts-gql/commit/d6d55946c9dfc118d87ba34b79d48d48a3144e4d), [`7f10732`](https://github.com/Thinkmill/ts-gql/commit/7f10732c53b1b9541414b6c343ad7cd1e35e122c), [`90d1567`](https://github.com/Thinkmill/ts-gql/commit/90d15672f4737d8a1c15429f680790c9abdccf58)]:
  - @ts-gql/config@0.6.0

## 0.6.1

### Patch Changes

- [`94d642d`](https://github.com/Thinkmill/ts-gql/commit/94d642d514dac32c183881cfe75e6cc61851707d) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Improve heuristic to determine when it is necessary to fetch an id

## 0.6.0

### Minor Changes

- [`63bbe54`](https://github.com/Thinkmill/ts-gql/commit/63bbe543b2ba34e14565ca3627187e37a9bbd619) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Throw a fixable error when ids aren't fetched for types that have them

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
