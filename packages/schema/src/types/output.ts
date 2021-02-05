import {
  GraphQLFieldExtensions,
  GraphQLInputType,
  GraphQLNullableType,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLResolveInfo,
  GraphQLType,
  GraphQLUnionType,
} from "graphql";
import { ListType, NonNullType } from ".";
import {
  Arg,
  InferValueFromArgs,
  InputType,
  ScalarType,
  EnumType,
} from "./types-that-do-not-use-context";

// TODO: once interfaces and unions are implemented, the requiring/not requiring of isTypeOf/resolveType:
// if resolveType is implemented on every interface that an object implements, the object type does not need to implement isTypeOf
// if isTypeOf is implemented on every member of a union, the union does not need to implement resolveType

// note that list and non-null are written directly here because of circular reference things
export type OutputTypeExcludingNonNull =
  | ScalarType<any>
  | ObjectType<any, string>
  | UnionType<ObjectType<any, string>>
  | EnumType<any>
  | {
      kind: "list";
      of: OutputTypes;
      graphQLType: GraphQLType;
    };

export type OutputTypes =
  | OutputTypeExcludingNonNull
  | {
      kind: "non-null";
      of: OutputTypeExcludingNonNull;
      graphQLType: GraphQLNullableType;
    };

type InferValueFromOutputTypeWithoutAddingNull<
  Type extends OutputTypes
> = Type extends ScalarType<infer Value>
  ? Value
  : Type extends EnumType<infer Values>
  ? Values[string]["value"]
  : Type extends ListType<infer Value>
  ? // TODO: remove the need for this conditional
    Value extends OutputTypes
    ? InferValueFromOutputType<Value>[]
    : never
  : Type extends ObjectType<infer RootVal, string>
  ? RootVal
  : Type extends UnionType<ObjectType<infer RootVal, string>>
  ? RootVal
  : never;

export type InferValueFromOutputType<
  Type extends OutputTypes
> = Type extends NonNullType<infer Value>
  ? // TODO: remove the need for this conditional
    Value extends OutputTypes
    ? InferValueFromOutputTypeWithoutAddingNull<Value>
    : never
  : InferValueFromOutputTypeWithoutAddingNull<Type> | null;

export type ObjectType<RootVal, Name extends string> = {
  kind: "object";
  name: Name;
  graphQLType: GraphQLObjectType;
  __rootVal: RootVal;
};

type MaybePromise<T> = Promise<T> | T;

export type OutputFieldResolver<
  Args extends Record<string, Arg<any>>,
  OutputType extends OutputTypes,
  RootVal
> = (
  rootVal: RootVal,
  args: InferValueFromArgs<Args>,
  context: unknown,
  info: GraphQLResolveInfo
) => MaybePromise<InferValueFromOutputType<OutputType>>;

type SomeTypeThatIsntARecordOfArgs = string;

export type OutputField<
  RootVal,
  Args extends Record<string, Arg<any>>,
  OutputType extends OutputTypes,
  Key extends string
> = {
  args?: Args;
  type: OutputType;
  __key: Key;
  __rootVal: RootVal;
  resolve?: OutputFieldResolver<Args, OutputType, RootVal>;
  deprecationReason?: string;
  description?: string;
  extensions?: Readonly<GraphQLFieldExtensions<RootVal, unknown>>;
};
export function field<
  RootVal,
  Args extends { [Key in keyof Args]: Arg<any, any> },
  OutputType extends OutputTypes,
  Key extends string
>(
  field: {
    args?: Args;
    type: OutputType;
    deprecationReason?: string;
    description?: string;
    extensions?: Readonly<GraphQLFieldExtensions<RootVal, unknown>>;
  } & (RootVal extends {
    [K in Key]: InferValueFromOutputType<OutputType>;
  }
    ? {
        resolve?: OutputFieldResolver<
          SomeTypeThatIsntARecordOfArgs extends Args ? {} : Args,
          OutputType,
          RootVal
        >;
      }
    : {
        resolve: OutputFieldResolver<
          SomeTypeThatIsntARecordOfArgs extends Args ? {} : Args,
          OutputType,
          RootVal
        >;
      })
): OutputField<RootVal, Args, OutputType, Key> {
  return field as any;
}

export function object<RootVal>() {
  return function objectInner<
    Name extends string,
    Fields extends {
      [Key in keyof Fields]: OutputField<
        RootVal,
        any,
        any,
        Extract<Key, string>
      >;
    }
  >(config: {
    name: Name;
    description?: string;
    deprecationReason?: string;
    fields: Fields | (() => Fields);
  }): ObjectType<RootVal, Name> {
    return {
      kind: "object",
      name: config.name,
      graphQLType: new GraphQLObjectType({
        name: config.name,
        description: config.description,
        fields: () => {
          const fields =
            typeof config.fields === "function"
              ? config.fields()
              : config.fields;
          return Object.fromEntries(
            Object.entries(
              fields as Record<
                string,
                OutputField<
                  any,
                  Record<string, Arg<InputType, any>>,
                  OutputTypes,
                  string
                >
              >
            ).map(([key, val]) => [
              key,
              {
                type: val.type.graphQLType as GraphQLOutputType,
                resolve: val.resolve,
                deprecationReason: val.deprecationReason,
                description: val.description,
                args: Object.fromEntries(
                  Object.entries(val.args || {}).map(([key, val]) => [
                    key,
                    {
                      type: val.type.graphQLType as GraphQLInputType,
                      description: val.description,
                      defaultValue: val.defaultValue,
                    },
                  ])
                ),
                extensions: val.extensions,
              },
            ])
          );
        },
      }),
      __rootVal: undefined as any,
    };
  };
}

export type UnionType<TObjectType extends ObjectType<any, string>> = {
  kind: "union";
  __rootVal: TObjectType["__rootVal"];
  graphQLType: GraphQLUnionType;
};

export function union<TObjectType extends ObjectType<any, string>>(config: {
  name: string;
  description?: string;
  types: TObjectType[];
  resolveType: (
    type: TObjectType["__rootVal"],
    context: unknown,
    info: GraphQLResolveInfo,
    abstractType: GraphQLUnionType
  ) => TObjectType["name"];
}): UnionType<TObjectType> {
  return {
    kind: "union",
    graphQLType: new GraphQLUnionType({
      name: config.name,
      description: config.description,
      types: config.types.map((x) => x.graphQLType),
      resolveType: config.resolveType as any,
    }),
    __rootVal: undefined as any,
  };
}
