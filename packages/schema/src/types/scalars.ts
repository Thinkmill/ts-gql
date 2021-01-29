import {
  GraphQLScalarType,
  GraphQLID,
  GraphQLString,
  GraphQLFloat,
  GraphQLInt,
  GraphQLBoolean,
} from "graphql";

export type ScalarType<Type> = {
  kind: "scalar";
  __type: Type;
  graphQLType: GraphQLScalarType;
};

export function custom<Type>(scalar: GraphQLScalarType): ScalarType<Type> {
  return {
    kind: "scalar",
    __type: undefined as any,
    graphQLType: scalar,
  };
}

export const ID: ScalarType<string> = custom<string>(GraphQLID);
export const String: ScalarType<string> = custom<string>(GraphQLString);
export const Float: ScalarType<number> = custom<number>(GraphQLFloat);
export const Int: ScalarType<number> = custom<number>(GraphQLInt);
export const Boolean: ScalarType<boolean> = custom<boolean>(GraphQLBoolean);
