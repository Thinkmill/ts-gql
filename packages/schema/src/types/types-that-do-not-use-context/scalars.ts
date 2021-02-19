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

export const ID: ScalarType<string> = scalar<string>(GraphQLID);
export const String: ScalarType<string> = scalar<string>(GraphQLString);
export const Float: ScalarType<number> = scalar<number>(GraphQLFloat);
export const Int: ScalarType<number> = scalar<number>(GraphQLInt);
export const Boolean: ScalarType<boolean> = scalar<boolean>(GraphQLBoolean);
