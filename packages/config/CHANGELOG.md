# @ts-gql/config

## 0.8.0

### Minor Changes

- [`603c9ed`](https://github.com/Thinkmill/ts-gql/commit/603c9ed186377c8de4517a8371aec08b45a3a425) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Add `schemaFilename` to `Config`, rename `schema` to `schemaFilename` on `RawConfig` and throw more useful errors when validating schemas

### Patch Changes

- [`3149ffe`](https://github.com/Thinkmill/ts-gql/commit/3149ffe2ffb428273e80451d8a67873073e052c8) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Support `graphql@^15.0.0`

## 0.7.1

### Patch Changes

- [`503d9c3`](https://github.com/Thinkmill/ts-gql/commit/503d9c361f32cb4855d017b7340c3b6db45d181b) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Optimise lazy requires

## 0.7.0

### Minor Changes

- [`71f257e`](https://github.com/Thinkmill/ts-gql/commit/71f257e5ec9152b01bcb86aa06810a8d84e1441d) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Change `schema` property of `Config` from having the `GraphQLSchema` to a function that returns the `GraphQLSchema`. This is so that the schema is not unnecessarily parsed when it doesn't need to be

### Patch Changes

- [`4e88d55`](https://github.com/Thinkmill/ts-gql/commit/4e88d551463c108fe30a609c24fa641e8f9ec88b) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Only import necessary modules from `graphql`

## 0.6.0

### Minor Changes

- [`d6d5594`](https://github.com/Thinkmill/ts-gql/commit/d6d55946c9dfc118d87ba34b79d48d48a3144e4d) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Replace `readSchema` and `readSchemaSync` with `parseSchema` and `hashSchema`

* [`7f10732`](https://github.com/Thinkmill/ts-gql/commit/7f10732c53b1b9541414b6c343ad7cd1e35e122c) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Cache schema parsing, remove `hashSchema`, make `parseSchema` return `schemaHash` and `schema`

- [`90d1567`](https://github.com/Thinkmill/ts-gql/commit/90d15672f4737d8a1c15429f680790c9abdccf58) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Add `schemaHash` to `Config`

## 0.5.0

### Minor Changes

- [`fba7341`](https://github.com/Thinkmill/ts-gql/commit/fba7341a1418e0a9d555172dc5c6e86899fa6ed3) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Add `readonlyTypes` option

## 0.4.0

### Minor Changes

- [`4be8faa`](https://github.com/Thinkmill/ts-gql/commit/4be8faafa0fba17efa491a0aec8ddbb472aa5572) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Replace `nonOptionalTypename` option with `addTypename` option

## 0.3.0

### Minor Changes

- [`d798897`](https://github.com/Thinkmill/ts-gql/commit/d7988972e801c41bb96aaa4dec5763ebae73e30e) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Add nonOptionalTypename option

## 0.2.0

### Minor Changes

- [`caa1974`](https://github.com/Thinkmill/ts-gql/commit/caa19743de1aa1345795691b8d4eea58c052fc8f) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Support scalars option

## 0.1.0

### Minor Changes

- [`e42383b`](https://github.com/Thinkmill/ts-gql/commit/e42383b5970a554462384f9851aabc173f7fcf52) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Initial Release
