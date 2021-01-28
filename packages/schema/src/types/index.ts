import { GraphQLList, GraphQLNonNull, GraphQLNullableType } from "graphql";
import { InputObject } from "./input";
import { ObjectType, Union } from "./output";
import { ScalarType } from "./scalars";
export * as scalars from "./scalars";
export * from "./input";
export type List<Of extends Types> = {
  kind: "list";
  of: Of;
  graphQLType: GraphQLList<Of["graphQLType"]>;
};

export function list<Of extends Types>(of: Of): List<Of> {
  return { kind: "list", of, graphQLType: new GraphQLList(of.graphQLType) };
}

export type NonNull<Of extends TypesExcludingNonNull> = {
  kind: "non-null";
  of: Of;
  graphQLType: GraphQLNonNull<Of["graphQLType"]>;
};

export function nonNullable<Of extends TypesExcludingNonNull>(
  of: Of
): NonNull<Of> {
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
  | List<any>
  | InputObject<any>
  | ObjectType<any, string>
  | Union<ObjectType<any, string>>;

export type Types =
  | TypesExcludingNonNull
  | {
      kind: "non-null";
      of: TypesExcludingNonNull;
      graphQLType: GraphQLNullableType;
    };
