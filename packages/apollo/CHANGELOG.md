# @ts-gql/apollo

## 0.11.0

### Minor Changes

- [`56aedff`](https://github.com/Thinkmill/ts-gql/commit/56aedff4aecb6ca3ea3215110833930ee544e1eb) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fixed support for TypeScript 4.3 and above in `refetchQueries` and dropped support for TypeScript 4.1 or below.

## 0.10.0

### Minor Changes

- [#90](https://github.com/Thinkmill/ts-gql/pull/90) [`dc22e45`](https://github.com/Thinkmill/ts-gql/commit/dc22e457d14c816274037010a627d10bcb30f11d) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Added support for `"mode": "no-transform"` and `"mode": "mixed"`. See https://github.com/Thinkmill/ts-gql/blob/main/docs/no-transform.md for more details

### Patch Changes

- Updated dependencies [[`dc22e45`](https://github.com/Thinkmill/ts-gql/commit/dc22e457d14c816274037010a627d10bcb30f11d), [`dc22e45`](https://github.com/Thinkmill/ts-gql/commit/dc22e457d14c816274037010a627d10bcb30f11d), [`dc22e45`](https://github.com/Thinkmill/ts-gql/commit/dc22e457d14c816274037010a627d10bcb30f11d), [`dc22e45`](https://github.com/Thinkmill/ts-gql/commit/dc22e457d14c816274037010a627d10bcb30f11d)]:
  - @ts-gql/tag@0.6.0

## 0.9.2

### Patch Changes

- [`7535729`](https://github.com/Thinkmill/ts-gql/commit/7535729362bbf04472b2e410286876eef0bd0e22) [#86](https://github.com/Thinkmill/ts-gql/pull/86) Thanks [@jesstelford](https://github.com/jesstelford)! - Support `query`'s `context` parameter, and tightens up `mutate`'s existing `context` parameter to be [more in line with Apollo's](https://github.com/apollographql/apollo-client/blob/main/src/core/types.ts#L16).

## 0.9.1

### Patch Changes

- [`69d2f4b`](https://github.com/Thinkmill/ts-gql/commit/69d2f4b77725bce7febc5ff3015a8678366ea98d) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Allow passing options to useMutation

## 0.9.0

### Minor Changes

- [`636c08d`](https://github.com/Thinkmill/ts-gql/commit/636c08d8dac3d080343e6d80f6127bee79a97a1f) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Type writeFragment, writeQuery, readQuery and readFragment correctly

## 0.8.1

### Patch Changes

- [`2bae58f`](https://github.com/Thinkmill/ts-gql/commit/2bae58f9d9a2944e0e6b0575f96fc3569973e1ac) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Import `ExecutionResult` from `graphql` rather than `@apollo/client`

## 0.8.0

### Minor Changes

- [`41ee599`](https://github.com/Thinkmill/ts-gql/commit/41ee5995cd05b189a58d9c2ec5f739bbbb0addc3) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Add useApolloClient

## 0.7.1

### Patch Changes

- [`7b2788e`](https://github.com/Thinkmill/ts-gql/commit/7b2788e451f1db0a61b424fae2ab10b27af61d6e) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fix bugs involving using `@ts-gql/apollo` and `@ts-gql/apollo-client-v2@0.2.0` together

## 0.7.0

### Minor Changes

- [`3a062d4`](https://github.com/Thinkmill/ts-gql/commit/3a062d421ea1c0f515334a2ab1d3e38234c4f400) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Disallow the usage of onCompleted and onError

## 0.6.1

### Patch Changes

- [`72467ba`](https://github.com/Thinkmill/ts-gql/commit/72467ba72dc625fec6cda50aae4e88903b638c74) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Fix a type

## 0.6.0

### Minor Changes

- [`ece17c7`](https://github.com/Thinkmill/ts-gql/commit/ece17c7adaedda085755d8ad06e822d45ac56f35) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Add peerDependency on react

## 0.5.0

### Minor Changes

- [`abba421`](https://github.com/Thinkmill/ts-gql/commit/abba4214b10bc878de9c7c9e350e5ef04f3ef11f) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Restrict the type of `refetchQueries` to be the name of queries rather than `string`

### Patch Changes

- Updated dependencies [[`abba421`](https://github.com/Thinkmill/ts-gql/commit/abba4214b10bc878de9c7c9e350e5ef04f3ef11f)]:
  - @ts-gql/tag@0.5.0

## 0.4.0

### Minor Changes

- [`0d551fd`](https://github.com/Thinkmill/ts-gql/commit/0d551fd388f97631ff90866c6e6ed91a57423037) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Re-export useQuery and useMutation from `@ts-gql/apollo` instead of declaration merging

## 0.3.0

### Minor Changes

- [`b83e180`](https://github.com/Thinkmill/ts-gql/commit/b83e180ea94cd7fb1d66d5c7835f333a5fcf56f5) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Rename some types

### Patch Changes

- Updated dependencies [[`b83e180`](https://github.com/Thinkmill/ts-gql/commit/b83e180ea94cd7fb1d66d5c7835f333a5fcf56f5)]:
  - @ts-gql/tag@0.4.0

## 0.2.1

### Patch Changes

- Updated dependencies [[`e4c60ad`](https://github.com/Thinkmill/ts-gql/commit/e4c60adcc45abba018c4b9d4d0379e7d529a9af1)]:
  - @ts-gql/tag@0.3.0

## 0.2.0

### Minor Changes

- [`8485b1a`](https://github.com/Thinkmill/ts-gql/commit/8485b1a28228feea836d076cc7dd1a0691414248) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Remove -with-required-variables types

### Patch Changes

- Updated dependencies [[`8485b1a`](https://github.com/Thinkmill/ts-gql/commit/8485b1a28228feea836d076cc7dd1a0691414248)]:
  - @ts-gql/tag@0.2.0

## 0.1.0

### Minor Changes

- [`b444283`](https://github.com/Thinkmill/ts-gql/commit/b44428353e6e94f7df60b8ffc409b44b6fbca1ca) Thanks [@mitchellhamilton](https://github.com/mitchellhamilton)! - Initial release

### Patch Changes

- Updated dependencies [[`b444283`](https://github.com/Thinkmill/ts-gql/commit/b44428353e6e94f7df60b8ffc409b44b6fbca1ca)]:
  - @ts-gql/tag@0.1.0
