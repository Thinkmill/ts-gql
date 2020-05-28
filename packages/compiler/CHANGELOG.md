# @ts-gql/compiler

## 0.11.0

### Minor Changes

- [`fba7341`](https://github.com/Thinkmill/ts-gql/commit/fba7341a1418e0a9d555172dc5c6e86899fa6ed3) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Add `readonlyTypes` option

### Patch Changes

- Updated dependencies [[`fba7341`](https://github.com/Thinkmill/ts-gql/commit/fba7341a1418e0a9d555172dc5c6e86899fa6ed3)]:
  - @ts-gql/config@0.5.0

## 0.10.0

### Minor Changes

- [`4be8faa`](https://github.com/Thinkmill/ts-gql/commit/4be8faafa0fba17efa491a0aec8ddbb472aa5572) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Replace `nonOptionalTypename` option with `addTypename` option

### Patch Changes

- Updated dependencies [[`4be8faa`](https://github.com/Thinkmill/ts-gql/commit/4be8faafa0fba17efa491a0aec8ddbb472aa5572)]:
  - @ts-gql/config@0.4.0

## 0.9.2

### Patch Changes

- [`6ab36e4`](https://github.com/Thinkmill/ts-gql/commit/6ab36e40298c2fb408ef7c543a2486bc592aeb56) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Stop using gitignore: true in globby to make ts-gql work on Windows

## 0.9.1

### Patch Changes

- [`13ceedf`](https://github.com/Thinkmill/ts-gql/commit/13ceedf590f127d19800765c8485a296be5ab575) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fix infinite loop with introspection result file

## 0.9.0

### Minor Changes

- [`f279b23`](https://github.com/Thinkmill/ts-gql/commit/f279b234ca1a264ed675863bccc9eca52b9d12f4) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Add @introspection.ts generated file with introspection query result

## 0.8.1

### Patch Changes

- [`974772a`](https://github.com/Thinkmill/ts-gql/commit/974772ab602e6f2e835e56afbd0f3c68dc28ad31) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fix watch mode having an incomplete config

## 0.8.0

### Minor Changes

- [`e97fd72`](https://github.com/Thinkmill/ts-gql/commit/e97fd72bc779c1804eddc34238aab57ffb63c9d7) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Stop using optional properties where they are actually null | T

## 0.7.2

### Patch Changes

- [`acb8a29`](https://github.com/Thinkmill/ts-gql/commit/acb8a292c0bb2cf54a6ba34b43ade27d36571794) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fix build failing

## 0.7.1

### Patch Changes

- [`da8e37b`](https://github.com/Thinkmill/ts-gql/commit/da8e37b6ce93f9f09c99306208312452161ab6c3) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fix referencing the same fragment twice in the same query resulting in an error

## 0.7.0

### Minor Changes

- [`1acfb89`](https://github.com/Thinkmill/ts-gql/commit/1acfb89b8aca3db55a5a583eac57bd26654e54b1) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Export `build` function

## 0.6.0

### Minor Changes

- [`d798897`](https://github.com/Thinkmill/ts-gql/commit/d7988972e801c41bb96aaa4dec5763ebae73e30e) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Add nonOptionalTypename option

### Patch Changes

- Updated dependencies [[`d798897`](https://github.com/Thinkmill/ts-gql/commit/d7988972e801c41bb96aaa4dec5763ebae73e30e)]:
  - @ts-gql/config@0.3.0

## 0.5.0

### Minor Changes

- [`caa1974`](https://github.com/Thinkmill/ts-gql/commit/caa19743de1aa1345795691b8d4eea58c052fc8f) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Support scalars option

### Patch Changes

- Updated dependencies [[`caa1974`](https://github.com/Thinkmill/ts-gql/commit/caa19743de1aa1345795691b8d4eea58c052fc8f)]:
  - @ts-gql/config@0.2.0

## 0.4.2

### Patch Changes

- [`afaa32a`](https://github.com/Thinkmill/ts-gql/commit/afaa32a387cecb21e329112487f716fbaf41e954) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fix a generated import in the schema types file

## 0.4.1

### Patch Changes

- [`23aba77`](https://github.com/Thinkmill/ts-gql/commit/23aba77d087ceb631f4952161062ab2b49821814) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fix generating incorrect error files

## 0.4.0

### Minor Changes

- [`e0cdba4`](https://github.com/Thinkmill/ts-gql/commit/e0cdba40c84c522845e860bec694d837bfaec684) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Add indentation back to printed GraphQL documents

* [`ef7a2fe`](https://github.com/Thinkmill/ts-gql/commit/ef7a2fec4b05b7a9b2622ccf5e5e7d5f564311ea) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Re-generate generated files if the content is not what the compiler generated

- [`987ae27`](https://github.com/Thinkmill/ts-gql/commit/987ae27ec21cfcd8d35d829385c1220431fc295b) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Optimise compiler performance

## 0.3.0

### Minor Changes

- [`abba421`](https://github.com/Thinkmill/ts-gql/commit/abba4214b10bc878de9c7c9e350e5ef04f3ef11f) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Include all documents on typed document nodes

### Patch Changes

- [`e42383b`](https://github.com/Thinkmill/ts-gql/commit/e42383b5970a554462384f9851aabc173f7fcf52) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Use `@ts-gql/config` package

- Updated dependencies [[`e42383b`](https://github.com/Thinkmill/ts-gql/commit/e42383b5970a554462384f9851aabc173f7fcf52)]:
  - @ts-gql/config@0.1.0

## 0.2.2

### Patch Changes

- [`25866e2`](https://github.com/Thinkmill/ts-gql/commit/25866e257bcae4c11fd8ab3ab8ee8f34fabe0d30) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fix a bug

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
