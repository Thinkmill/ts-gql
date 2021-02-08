import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLNullableType,
} from "graphql/type/definition";
import { ObjectType, UnionType } from "../output";
import {
  EnumType as EnumType,
  InputObjectType as InputObjectType,
  ScalarType,
} from ".";

export type ListType<Of extends Types, Context = unknown> = {
  kind: "list";
  of: Of;
  __context: Context;
  graphQLType: GraphQLList<Of["graphQLType"]>;
};

export function list<Of extends Types>(of: Of): ListType<Of> {
  return {
    kind: "list",
    of,
    __context: of["__context"],
    graphQLType: new GraphQLList(of.graphQLType),
  };
}

export type NonNullType<Of extends TypesExcludingNonNull> = {
  kind: "non-null";
  of: Of;
  __context: Of["__context"];
  graphQLType: GraphQLNonNull<Of["graphQLType"]>;
};

export function nonNull<Of extends TypesExcludingNonNull>(
  of: Of
): NonNullType<Of> {
  return {
    kind: "non-null",
    of,
    __context: of["__context"],
    graphQLType: new GraphQLNonNull(of.graphQLType) as GraphQLNonNull<
      Of["graphQLType"]
    >,
  };
}

export type TypesExcludingNonNull =
  | ScalarType<any>
  | ListType<any>
  | InputObjectType<any>
  | ObjectType<any, string, any>
  | UnionType<ObjectType<any, string, any>>
  | EnumType<any>;

export type Types =
  | TypesExcludingNonNull
  | {
      kind: "non-null";
      of: TypesExcludingNonNull;
      graphQLType: GraphQLNullableType;
      __context: unknown;
    };
