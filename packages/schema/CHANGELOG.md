# @ts-gql/schema

## 0.11.1

### Patch Changes

- [`1d9e5e5`](https://github.com/Thinkmill/ts-gql/commit/1d9e5e5f52d45c2a9d6eb8423f3a31ad58935d13) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed excess properties/default values that don't match the type being allowed to be passed to `types.arg()`

## 0.11.0

### Minor Changes

- [`64a74d3`](https://github.com/Thinkmill/ts-gql/commit/64a74d3fde71d3c214007546acc0686423c58af2) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed inference of `defaultValue` in `types.arg` to infer the `DefaultValue` to be `undefined` when `defaultValue` is not passed

## 0.10.0

### Minor Changes

- [`c664466`](https://github.com/Thinkmill/ts-gql/commit/c6644660d1a8de194872a9153e8e7d37a8bcfa41) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed `defaultValue` with `types.arg` being inferred incorrectly.

## 0.9.0

### Minor Changes

- [`80138fe`](https://github.com/Thinkmill/ts-gql/commit/80138fe1b12bab45017eb76b019579647b558f16) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Added `types-with-context` entrypoint to allow for a different strategy of binding the `TypesWithContext` functions to a context type that will preserve JSDoc comments on the `TypesWithContext` functions

## 0.8.0

### Minor Changes

- [`5b10893`](https://github.com/Thinkmill/ts-gql/commit/5b108934c0aeccb4947b8d89798dab6ec9820d08) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Lots of type renaming, type parameter adding re-ordering and the addition of TypeScript types available on the exported `types` object that are bound to the specific context type(which for the exported `types` object is `unknown`) and the removal of all non-context bound functions from `bindTypesToContext`

## 0.7.3

### Patch Changes

- [`0b9c783`](https://github.com/Thinkmill/ts-gql/commit/0b9c7838568b6837ad0c9cb43bac476f17e18f53) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - The types for resolvers now allow returning an array of promises for list types.

## 0.7.2

### Patch Changes

- [`4c2a7d1`](https://github.com/Thinkmill/ts-gql/commit/4c2a7d117cb9773d48f829a8562dc300c37cfd83) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Added support for `deprecationReason` on GraphQL arguments/input fields

## 0.7.1

### Patch Changes

- [`45e1a24`](https://github.com/Thinkmill/ts-gql/commit/45e1a24511b810cd492a363c4ca85371944fb49e) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Added checks to types.field and types.arg which throw if a type isn't passed so that it's easier to see why a type wasn't passed rather than getting an error when mapping the fields to graphql-js arguments

## 0.7.0

### Minor Changes

- [`af755ec`](https://github.com/Thinkmill/ts-gql/commit/af755ecb0e25f7c3e1f6c9f27f1104aa48fc9df9) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed various bugs with interfaces and bindTypesToContext

## 0.6.0

### Minor Changes

- [`1404564`](https://github.com/Thinkmill/ts-gql/commit/14045646b88dcd8e50ca1c21b43c0230d79b4726) [#70](https://github.com/Thinkmill/ts-gql/pull/70) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Added `fields` function to share fields between multiple object types while inferring the `Key` of the fields correctly

* [`1404564`](https://github.com/Thinkmill/ts-gql/commit/14045646b88dcd8e50ca1c21b43c0230d79b4726) [#70](https://github.com/Thinkmill/ts-gql/pull/70) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Various correctness fixes around the typing of RootVal and Context

- [`0b598b3`](https://github.com/Thinkmill/ts-gql/commit/0b598b3f489041f1d8e177b327d21c68b83bfe7b) [#72](https://github.com/Thinkmill/ts-gql/pull/72) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - First pass at an implementation of GraphQL interfaces. The API is quite likely to change.

## 0.5.1

### Patch Changes

- [`f39352d`](https://github.com/Thinkmill/ts-gql/commit/f39352dd0cc5324edabb722e717d3c7f027662d0) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed the value of enums being inferred to unknown rather than the actual values

## 0.5.0

### Minor Changes

- [`3c07b55`](https://github.com/Thinkmill/ts-gql/commit/3c07b552a250c23e3fdb56aa3587306a8189b25f) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Moved exported TypeScript types from the `types` export to top-level exports create consistency with using the `types` export and `bindTypesToContext`.

## 0.4.0

### Minor Changes

- [`b2a88cf`](https://github.com/Thinkmill/ts-gql/commit/b2a88cf7a0e9e9875c54c40695f8a9ce324b4c0c) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Removed `Context` type parameter to `ListType` type to be consistent with `NonNullType`.

### Patch Changes

- [`b2a88cf`](https://github.com/Thinkmill/ts-gql/commit/b2a88cf7a0e9e9875c54c40695f8a9ce324b4c0c) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed inference of input lists with non null inside them

## 0.3.1

### Patch Changes

- [`8d19a88`](https://github.com/Thinkmill/ts-gql/commit/8d19a886de62bfb9d5a6d9302d9f43500502b263) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fix types.arg returned from bindTypesToContext requiring a defaultValue

## 0.3.0

### Minor Changes

- [`d57bee5`](https://github.com/Thinkmill/ts-gql/commit/d57bee5a9c94c9937cc8308caa6e39a7a40f17eb) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Export `bindTypesToContext` directly rather than in `types`

## 0.2.0

### Minor Changes

- [`2a7f889`](https://github.com/Thinkmill/ts-gql/commit/2a7f88954915834440a3e6c6178dba622435806a) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Replace `bindObjectTypeToContext` with `bindTypesToContext` and rename `types.custom` to `types.scalar`

## 0.1.0

### Minor Changes

- [`7425f01`](https://github.com/Thinkmill/ts-gql/commit/7425f013822d5b302f8398a7b23008ae9f387df3) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Various fixes

## 0.0.3

### Patch Changes

- [`f4c55aa`](https://github.com/Thinkmill/ts-gql/commit/f4c55aaaf0272f9e77e7f185dfc3b6d7d8f2c0e7) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Add `GraphQLBoolean`

## 0.0.2

### Patch Changes

- [`f4b9909`](https://github.com/Thinkmill/ts-gql/commit/f4b99099e4b3fcfbd481ad19821703fd425f4390) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Export object and union types

## 0.0.1

### Patch Changes

- [`b879c3b`](https://github.com/Thinkmill/ts-gql/commit/b879c3b453051d31c811df8e67c23faa954b07e1) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Initial release
