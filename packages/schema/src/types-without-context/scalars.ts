import { GraphQLScalarType } from "graphql/type/definition";
import {
  GraphQLID,
  GraphQLString,
  GraphQLFloat,
  GraphQLInt,
  GraphQLBoolean,
} from "graphql/type/scalars";

/**
 * A scalar type for `@ts-gql/schema` which wraps an underlying graphql-js
 * `GraphQLScalarType` with an type representing the deserialized form of the scalar.
 *
 * @example
 *   declare const someScalar: ScalarType<string>;
 *
 *   // for fields on output types
 *   types.field({ type: someScalar });
 *
 *   // for args on output fields or fields on input types
 *   types.arg({ type: someScalar });
 *
 * @template Type The type of a value of the scalar
 */
export type ScalarType<Type> = {
  kind: "scalar";
  __type: Type;
  __context: (context: unknown) => void;
  graphQLType: GraphQLScalarType;
};

/**
 * Creates a `@ts-gql/schema` scalar type from a graphql-js scalar.
 *
 * You should provide a type as a type parameter which is the type of the scalar
 * value. Note, while graphql-js allows you to express scalar types like the
 * `ID` type which accepts integers and strings as both input values and return
 * values from resolvers which are transformed into strings before calling
 * resolvers and returning the query respectively, the type you use should be
 * `string` for `ID` since that is what it is transformed into. `@ts-gql/schema`
 * doesn't currently express the coercion of scalars, you should instead convert
 * values to the canonical form yourself before returning from resolvers.
 *
 * @example
 *   const JSON = types.scalar<JSONValue>(GraphQLJSON);
 */
export function scalar<Type>(scalar: GraphQLScalarType): ScalarType<Type> {
  return {
    kind: "scalar",
    __type: undefined as any,
    __context: undefined as any,
    graphQLType: scalar,
  };
}

export const ID: ScalarType<string> = scalar<string>(GraphQLID);
export const String: ScalarType<string> = scalar<string>(GraphQLString);
export const Float: ScalarType<number> = scalar<number>(GraphQLFloat);
export const Int: ScalarType<number> = scalar<number>(GraphQLInt);
export const Boolean: ScalarType<boolean> = scalar<boolean>(GraphQLBoolean);
