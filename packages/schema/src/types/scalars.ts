import {
  GraphQLScalarType,
  GraphQLID,
  GraphQLString,
  GraphQLFloat,
  GraphQLInt,
} from "graphql";

export type ScalarType<Type> = {
  kind: "scalar";
  __type: Type;
  graphQLType: GraphQLScalarType;
};

export const ID: ScalarType<string> = {
  kind: "scalar",
  __type: undefined as any,
  graphQLType: GraphQLID,
};
export const String: ScalarType<string> = {
  kind: "scalar",
  __type: undefined as any,
  graphQLType: GraphQLString,
};
export const Float: ScalarType<number> = {
  kind: "scalar",
  __type: undefined as any,
  graphQLType: GraphQLFloat,
};
export const Int: ScalarType<number> = {
  kind: "scalar",
  __type: undefined as any,
  graphQLType: GraphQLInt,
};
export function custom<Type>(scalar: GraphQLScalarType): ScalarType<Type> {
  return {
    kind: "scalar",
    __type: undefined as any,
    graphQLType: scalar,
  };
}
