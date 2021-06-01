import {
  GraphQLEnumType,
  GraphQLEnumTypeExtensions,
} from "graphql/type/definition";

/**
 * An individual enum value
 *
 * Note the value property and generic here represents the deserialized form of
 * the enum. It does not indicate the name of the enum value that is visible in
 * the GraphQL schema. The value can be anything, not necessarily a string.
 * Usually though, it will be a string which is equal to the key where the value is used.
 */
export type EnumValue<Value> = {
  description?: string;
  deprecationReason?: string;
  value: Value;
};

/**
 * An enum type for `@ts-gql/schema` which wraps an underlying graphql-js
 * `GraphQLEnumType`. This should be created with `types.enum`.
 *
 * ```ts
 * const MyEnum = types.enum({
 *   name: "MyEnum",
 *   values: types.enumValues(["a", "b"]),
 * });
 * // ==
 * graphql`
 *   enum MyEnum {
 *     a
 *     b
 *   }
 * `;
 * ```
 */
export type EnumType<Values extends Record<string, EnumValue<any>>> = {
  kind: "enum";
  values: Values;
  graphQLType: GraphQLEnumType;
  __context: unknown;
};

/**
 * A shorthand to easily create enum values to pass to `types.enum`.
 *
 * If you need to set a `description` or `deprecationReason` for an enum
 * variant, you should pass values directly to `types.enum` without using
 * `types.enumValues`.
 *
 * ```ts
 * const MyEnum = types.enum({
 *   name: "MyEnum",
 *   values: types.enumValues(["a", "b"]),
 * });
 * ```
 * ---
 * ```ts
 * const values = types.enumValues(["a", "b"]);
 *
 * assertDeepEqual(values, {
 *   a: { value: "a" },
 *   b: { value: "b" },
 * });
 * ```
 */
export function enumValues<Values extends readonly string[]>(
  values: readonly [...Values]
): Record<Values[number], EnumValue<Values[number]>> {
  return Object.fromEntries(values.map((value) => [value, { value }]));
}

/**
 * Creates a GraphQL enum to be used within a schema created within `@ts-gql/schema`
 *
 * ```ts
 * const MyEnum = types.enum({
 *   name: "MyEnum",
 *   values: types.enumValues(["a", "b"]),
 * });
 * // ==
 * graphql`
 *   enum MyEnum {
 *     a
 *     b
 *   }
 * `;
 * ```
 * ---
 * ```ts
 * const MyEnum = types.enum({
 *   name: "MyEnum",
 *   description: "My enum does things",
 *   values: {
 *     something: {
 *       description: "something something",
 *       value: "something",
 *     },
 *     thing: {
 *       description: "thing thing",
 *       deprecationReason: "something should be used instead of thing",
 *       value: "thing",
 *     },
 *   },
 * });
 * // ==
 * graphql`
 *   """
 *   My enum does things
 *   """
 *   enum MyEnum {
 *     """
 *     something something
 *     """
 *     something
 *     """
 *     thing thing
 *     """
 *     thing ​@deprecated(reason: "something should be used instead of thing")
 *   }
 * `;
 * ```
 */
function enumType<Values extends Record<string, EnumValue<any>>>(config: {
  name: string;
  description?: string;
  extensions?: Readonly<GraphQLEnumTypeExtensions>;
  values: Values;
}): EnumType<Values> {
  const graphQLType = new GraphQLEnumType({
    name: config.name,
    description: config.description,
    extensions: config.extensions,
    values: config.values,
  });
  return {
    kind: "enum",
    values: config.values,
    graphQLType,
    __context: undefined as any,
  };
}

export { enumType as enum };
