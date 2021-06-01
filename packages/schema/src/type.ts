import { GraphQLNullableType } from "graphql/type/definition";
import {
  ScalarType,
  ListType,
  InputObjectType,
  ObjectType,
  UnionType,
  InterfaceType,
  EnumType,
} from ".";

export type NullableType<Context> =
  | ScalarType<any>
  | ListType<any>
  | InputObjectType<any>
  | ObjectType<any, Context>
  | UnionType<any, Context>
  | InterfaceType<any, any, Context>
  | EnumType<any>;

export type Type<Context> =
  | NullableType<Context>
  | {
      kind: "non-null";
      of: NullableType<Context>;
      graphQLType: GraphQLNullableType;
      __context: unknown;
    };
