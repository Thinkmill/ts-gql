import { GraphQLNullableType, GraphQLObjectType, GraphQLType } from "graphql";
import { List, NonNull, scalars } from ".";
import { arg, Arg, InferValueFromArg } from "./input";
import { ScalarType } from "./scalars";

// TODO: once interfaces and unions are implemented, the requiring/not requiring of isTypeOf/resolveType:
// if resolveType is implemented on every interface that an object implements, the object type does not need to implement isTypeOf
// if isTypeOf is implemented on every member of a union, the union does not need to implement resolveType

// TODO: make it so not specifying args makes args empty not any

// note that list and non-null are written directly here because of circular reference things
export type OutputTypeExcludingNonNull =
  | ScalarType<any>
  | ObjectType<any>
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
  : Type extends List<infer Value>
  ? // TODO: remove the need for this conditional
    Value extends OutputTypes
    ? readonly InferValueFromOutputTypeWithoutAddingNull<Value>[]
    : never
  : Type extends ObjectType<infer RootVal>
  ? RootVal
  : never;

export type InferValueFromOutputType<
  Type extends OutputTypes
> = Type extends NonNull<infer Value>
  ? // TODO: remove the need for this conditional
    Value extends OutputTypes
    ? InferValueFromOutputTypeWithoutAddingNull<Value>
    : never
  : InferValueFromOutputTypeWithoutAddingNull<Type> | null;

export type ObjectType<RootVal> = {
  kind: "object";
  graphQLType: GraphQLObjectType;
  __rootVal: RootVal;
};

type MaybePromise<T> = Promise<T> | T;

type OutputFieldResolver<
  Args extends Record<string, Arg<any>>,
  OutputType extends OutputTypes,
  RootVal
> = (
  rootVal: RootVal,
  args: { readonly [Key in keyof Args]: InferValueFromArg<Args[Key]> },
  context: unknown
) => MaybePromise<InferValueFromOutputType<OutputType>>;

type SomeTypeThatIsntARecordOfArgs = string;

type OutputField<
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
};
function field<
  RootVal,
  Args extends { [Key in keyof Args]: Arg<any, any> },
  OutputType extends OutputTypes,
  Key extends string
>(
  field: {
    args?: Args;
    type: OutputType;
    rootVal?: RootVal;
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

object<{ thing: true }>()({
  name: "",
  fields: {
    thing: field({
      type: scalars.String,
      args: { asdasd: arg({ type: scalars.String }) },
      resolve(rootVal, args) {
        rootVal;
        args;
        return null;
      },
    }),
  },
});

export function object<RootVal>() {
  return function objectInner<
    Fields extends {
      [Key in keyof Fields]: OutputField<
        RootVal,
        any,
        any,
        Extract<Key, string>
      >;
    }
  >(config: {
    name: string;
    description?: string;
    deprecationReason?: string;
    fields: Fields;
  }): ObjectType<RootVal> {
    return {
      kind: "object",
      graphQLType: new GraphQLObjectType({
        name: config.name,
        description: config.description,
        fields: () => {
          return {};
        },
      }),
      __rootVal: undefined as any,
    };
  };
}
