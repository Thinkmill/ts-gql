# @ts-gql/compiler

## 0.14.3

### Patch Changes

- [`17abf8d`](https://github.com/Thinkmill/ts-gql/commit/17abf8d650c98a3ced408bcd4bf9c83e006233d2) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Stopped removing invalid files when running the watcher. This isn't really solving an issue with ts-gql but attempting to fix https://github.com/Thinkmill/ts-gql/issues/52 where files are deleted and tools don't expect them to be deleted and then the process exits.

## 0.14.2

### Patch Changes

- [`361dc86`](https://github.com/Thinkmill/ts-gql/commit/361dc8689ac035d0d14c8cd6a47f0c1d15c889e8) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fix removing of files in `__generated__/ts-gql` for files that don't end in `.ts`

## 0.14.1

### Patch Changes

- [`3c0b9c4`](https://github.com/Thinkmill/ts-gql/commit/3c0b9c42a7293fdd2bb80c88761de22324cabeb1) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fix watcher crashing on a syntax error

## 0.14.0

### Minor Changes

- [`b7e2775`](https://github.com/Thinkmill/ts-gql/commit/b7e2775618dc8ffbf320a02c01706a97933c7458) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Remove `getGeneratedTypes` export. Use `build` or `watch` instead.

### Patch Changes

- [`3b426f3`](https://github.com/Thinkmill/ts-gql/commit/3b426f3ca4124ffc63f25cb79dab639d5b7db7a1) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Improve terminal output in watch mode

* [`3149ffe`](https://github.com/Thinkmill/ts-gql/commit/3149ffe2ffb428273e80451d8a67873073e052c8) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Support `graphql@^15.0.0`

* Updated dependencies [[`603c9ed`](https://github.com/Thinkmill/ts-gql/commit/603c9ed186377c8de4517a8371aec08b45a3a425), [`3149ffe`](https://github.com/Thinkmill/ts-gql/commit/3149ffe2ffb428273e80451d8a67873073e052c8)]:
  - @ts-gql/config@0.8.0

## 0.13.6

### Patch Changes

- [`503d9c3`](https://github.com/Thinkmill/ts-gql/commit/503d9c361f32cb4855d017b7340c3b6db45d181b) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Optimise lazy requires

- Updated dependencies [[`503d9c3`](https://github.com/Thinkmill/ts-gql/commit/503d9c361f32cb4855d017b7340c3b6db45d181b)]:
  - @ts-gql/config@0.7.1

## 0.13.5

### Patch Changes

- [`4e88d55`](https://github.com/Thinkmill/ts-gql/commit/4e88d551463c108fe30a609c24fa641e8f9ec88b) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Only import necessary modules from `graphql`

- Updated dependencies [[`4e88d55`](https://github.com/Thinkmill/ts-gql/commit/4e88d551463c108fe30a609c24fa641e8f9ec88b), [`71f257e`](https://github.com/Thinkmill/ts-gql/commit/71f257e5ec9152b01bcb86aa06810a8d84e1441d)]:
  - @ts-gql/config@0.7.0

## 0.13.4

### Patch Changes

- [`90d1567`](https://github.com/Thinkmill/ts-gql/commit/90d15672f4737d8a1c15429f680790c9abdccf58) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Remove unnecessary schema printing

* [`2df884a`](https://github.com/Thinkmill/ts-gql/commit/2df884a168c5e4285956f70ff10bb70f80704484) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Cache document validation

- [`19fd7d9`](https://github.com/Thinkmill/ts-gql/commit/19fd7d98c4bb0a290f1cfe831608a5c13f498b22) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Cache extraction of GraphQL documents

* [`d6d5594`](https://github.com/Thinkmill/ts-gql/commit/d6d55946c9dfc118d87ba34b79d48d48a3144e4d) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Avoid re-parsing the schema on every rebuild in watch mode

- [`ccf3770`](https://github.com/Thinkmill/ts-gql/commit/ccf37705e7f58a31906c9b96dbd27ded2447d817) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Remove duplicated errors when there's a validation error in a fragment

- Updated dependencies [[`d6d5594`](https://github.com/Thinkmill/ts-gql/commit/d6d55946c9dfc118d87ba34b79d48d48a3144e4d), [`7f10732`](https://github.com/Thinkmill/ts-gql/commit/7f10732c53b1b9541414b6c343ad7cd1e35e122c), [`90d1567`](https://github.com/Thinkmill/ts-gql/commit/90d15672f4737d8a1c15429f680790c9abdccf58)]:
  - @ts-gql/config@0.6.0

## 0.13.3

### Patch Changes

- [`bd25bf8`](https://github.com/Thinkmill/ts-gql/commit/bd25bf83e5a4c4f8fa32505cc1d6a7f4095708c6) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Remove unnecessary printing of the schema when generating types for every operation/fragment

## 0.13.2

### Patch Changes

- [`0e9f5c3`](https://github.com/Thinkmill/ts-gql/commit/0e9f5c3b46a8239c099ff6498f24c3f5b95ffa16) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fix edge case with fragment inlining

## 0.13.1

### Patch Changes

- [`b81322a`](https://github.com/Thinkmill/ts-gql/commit/b81322aaba12b48677f23cc4afd708143f3b48eb) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Inline fragments before generating types so that arrays are never intersected in the generated types because intersecting arrays doesn't do what you want in TypeScript.

## 0.13.0

### Minor Changes

- [`2c04c58`](https://github.com/Thinkmill/ts-gql/commit/2c04c58c69c0f209ad6c5281e7093686984b6557) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Replace generated object literals with JSON.parse calls

## 0.12.1

### Patch Changes

- Fix broken release

## 0.12.0

### Minor Changes

- [`0b8679c`](https://github.com/Thinkmill/ts-gql/commit/0b8679cd9d7e3a47c63071559f344fa22d7aaa64) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Make nullable fields on input types optional

## 0.11.1

### Patch Changes

- [`95155b8`](https://github.com/Thinkmill/ts-gql/commit/95155b8f8a666b50b9842f9443c275502c061d8e) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fix the directory that the schema types are generated in

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
