import { GraphQLList, GraphQLNonNull, GraphQLNullableType } from "graphql";
import { ObjectType, UnionType } from "./output";
import {
  EnumType as EnumType,
  InputObjectType as InputObjectType,
  ScalarType,
} from "./types-that-do-not-use-context";

export type ListType<Of extends Types> = {
  kind: "list";
  of: Of;
  graphQLType: GraphQLList<Of["graphQLType"]>;
};

export function list<Of extends Types>(of: Of): ListType<Of> {
  return { kind: "list", of, graphQLType: new GraphQLList(of.graphQLType) };
}

export type NonNullType<Of extends TypesExcludingNonNull> = {
  kind: "non-null";
  of: Of;
  graphQLType: GraphQLNonNull<Of["graphQLType"]>;
};

export function nonNull<Of extends TypesExcludingNonNull>(
  of: Of
): NonNullType<Of> {
  return {
    kind: "non-null",
    of,
    graphQLType: new GraphQLNonNull(of.graphQLType) as GraphQLNonNull<
      Of["graphQLType"]
    >,
  };
}

export type TypesExcludingNonNull =
  | ScalarType<any>
  | ListType<any>
  | InputObjectType<any>
  | ObjectType<any, string>
  | UnionType<ObjectType<any, string>>
  | EnumType<any>;

export type Types =
  | TypesExcludingNonNull
  | {
      kind: "non-null";
      of: TypesExcludingNonNull;
      graphQLType: GraphQLNullableType;
    };
