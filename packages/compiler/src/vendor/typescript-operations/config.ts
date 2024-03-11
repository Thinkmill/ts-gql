import {
  AvoidOptionalsConfig,
  RawDocumentsConfig,
} from "../visitor-plugin-common";

/**
 * @description This plugin generates TypeScript types based on your GraphQLSchema _and_ your GraphQL operations and fragments.
 * It generates types for your GraphQL documents: Query, Mutation, Subscription and Fragment.
 *
 * Note: In most configurations, this plugin requires you to use `typescript as well, because it depends on its base types.
 */
export interface TypeScriptDocumentsPluginConfig extends RawDocumentsConfig {
  /**
   * @description The [GraphQL spec](https://spec.graphql.org/draft/#sel-FAHjBJFCAACE_Gh7d)
   * allows arrays and a single primitive value for list input. This allows to
   * deactivate that behavior to only accept arrays instead of single values. If
   * set to `false`, the definition: `query foo(bar: [Int!]!): Foo` will output
   * `bar: Array<Int>` instead of `bar: Array<Int> | Int` for the variable part.
   * @default true
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file.ts': {
   *        plugins: ['typescript'],
   *        config: {
   *          arrayInputCoercion: false
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  arrayInputCoercion?: boolean;
  /**
   * @description This will cause the generator to avoid using TypeScript optionals (`?`) on types,
   * so the following definition: `type A { myField: String }` will output `myField: Maybe<string>`
   * instead of `myField?: Maybe<string>`.
   * @default false
   *
   * @exampleMarkdown
   * ## Override all definition types
   *
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file.ts': {
   *        plugins: ['typescript'],
   *        config: {
   *          avoidOptionals: true
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   *
   * ## Override only specific definition types
   *
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file.ts': {
   *        plugins: ['typescript'],
   *        config: {
   *          avoidOptionals: {
   *            field: true
   *            inputValue: true
   *            object: true
   *            defaultValue: true
   *          }
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  avoidOptionals?: boolean | AvoidOptionalsConfig;
  /**
   * @description Generates immutable types by adding `readonly` to properties and uses `ReadonlyArray`.
   * @default false
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file.ts': {
   *        plugins: ['typescript'],
   *        config: {
   *          immutableTypes: true
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  immutableTypes?: boolean;

  /**
   * @description Set to `true` in order to generate output without `export` modifier.
   * This is useful if you are generating `.d.ts` file and want it to be globally available.
   * @default false
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file.ts': {
   *        plugins: ['typescript'],
   *        config: {
   *          noExport: true
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  noExport?: boolean;
  /**
   * @description Allow to override the type value of `Maybe`.
   * @default T | null
   *
   * @exampleMarkdown
   * ## Allow undefined
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file.ts': {
   *        plugins: ['typescript'],
   *        config: {
   *          maybeValue: 'T | null | undefined'
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   *
   * ## Allow `null` in resolvers:
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file.ts': {
   *        plugins: ['typescript'],
   *        config: {
   *          maybeValue: 'T extends PromiseLike<infer U> ? Promise<U | null> : T | null'
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  maybeValue?: string;

  /**
   * @description Adds undefined as a possible type for query variables
   * @default false
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file.ts': {
   *        plugins: ['typescript'],
   *        config: {
   *          allowUndefinedQueryVariables: true
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */

  allowUndefinedQueryVariables?: boolean;
}
