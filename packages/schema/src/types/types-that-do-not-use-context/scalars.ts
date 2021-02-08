import { GraphQLScalarType } from "graphql/type/definition";
import {
  GraphQLID,
  GraphQLString,
  GraphQLFloat,
  GraphQLInt,
  GraphQLBoolean,
} from "graphql/type/scalars";

export type ScalarType<Type> = {
  kind: "scalar";
  __type: Type;
  __context: unknown;
  graphQLType: GraphQLScalarType;
};

export function scalar<Type>(scalar: GraphQLScalarType): ScalarType<Type> {
  return {
    kind: "scalar",
    __type: undefined as any,
    __context: undefined,
    graphQLType: scalar,
  };
}

// it's often convenient to have the type of a scalar and doing typeof is kindof annoying
export type ID = ScalarType<string>;
export const ID: ScalarType<string> = scalar<string>(GraphQLID);
export type String = ScalarType<string>;
export const String: ScalarType<string> = scalar<string>(GraphQLString);
export type Float = ScalarType<number>;
export const Float: ScalarType<number> = scalar<number>(GraphQLFloat);
export type Int = ScalarType<number>;
export const Int: ScalarType<number> = scalar<number>(GraphQLInt);
export type Boolean = ScalarType<boolean>;
export const Boolean: ScalarType<boolean> = scalar<boolean>(GraphQLBoolean);
