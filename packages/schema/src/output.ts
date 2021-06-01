import {
  GraphQLFieldConfigMap,
  GraphQLFieldExtensions,
  GraphQLInputType,
  GraphQLInterfaceType,
  GraphQLInterfaceTypeExtensions,
  GraphQLIsTypeOfFn,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLObjectTypeExtensions,
  GraphQLOutputType,
  GraphQLResolveInfo,
  GraphQLTypeResolver,
  GraphQLUnionType,
} from "graphql/type/definition";
import {
  Arg,
  InferValueFromArgs,
  InputType,
  ScalarType,
  EnumType,
} from "./types-without-context";

type OutputListType<Of extends OutputType<any>> = {
  kind: "list";
  of: Of;
  graphQLType: GraphQLList<Of["graphQLType"]>;
};

type OutputNonNullType<Of extends NullableOutputType<any>> = {
  kind: "non-null";
  of: Of;
  graphQLType: GraphQLNonNull<Of["graphQLType"]>;
};

type OutputListTypeWithContext<Context> = {
  kind: "list";
  of: OutputType<Context>;
  graphQLType: GraphQLList<any>;
};

type OutputNonNullTypeWithContext<Context> = {
  kind: "non-null";
  of: NullableOutputType<Context>;
  graphQLType: GraphQLNonNull<NullableOutputType<Context>["graphQLType"]>;
};

export type NullableOutputType<Context> =
  | ScalarType<any>
  | ObjectType<any, Context>
  | UnionType<any, Context>
  | InterfaceType<any, any, Context>
  | EnumType<any>
  | OutputListTypeWithContext<Context>;

export type OutputType<Context> =
  | NullableOutputType<Context>
  | OutputNonNullTypeWithContext<Context>;

type InferValueFromOutputTypeWithoutAddingNull<Type extends OutputType<any>> =
  Type extends ScalarType<infer Value>
    ? Value
    : Type extends EnumType<infer Values>
    ? Values[keyof Values]["value"]
    : Type extends OutputListType<infer Value>
    ? InferValueFromOutputType<Value>[]
    : Type extends ObjectType<infer RootVal, any>
    ? RootVal
    : Type extends UnionType<infer RootVal, any>
    ? RootVal
    : Type extends InterfaceType<infer RootVal, any, any>
    ? RootVal
    : never;

export type InferValueFromOutputType<Type extends OutputType<any>> =
  MaybePromise<
    Type extends OutputNonNullType<infer Value>
      ? InferValueFromOutputTypeWithoutAddingNull<Value>
      : InferValueFromOutputTypeWithoutAddingNull<Type> | null
  >;

export type ObjectType<RootVal, Context> = {
  kind: "object";
  graphQLType: GraphQLObjectType;
  __context: (context: Context) => void;
  __rootVal: RootVal;
};

type MaybePromise<T> = Promise<T> | T;

export type FieldResolver<
  RootVal,
  Args extends Record<string, Arg<any>>,
  TType extends OutputType<Context>,
  Context
> = (
  rootVal: RootVal,
  args: InferValueFromArgs<Args>,
  context: Context,
  info: GraphQLResolveInfo
) => InferValueFromOutputType<TType>;

type SomeTypeThatIsntARecordOfArgs = string;

export type Field<
  RootVal,
  Args extends Record<string, Arg<any>>,
  TType extends OutputType<Context>,
  Key extends string,
  Context
> = {
  args?: Args;
  type: TType;
  __key: Key;
  __rootVal: (rootVal: RootVal) => void;
  __context: (context: Context) => void;
  resolve?: FieldResolver<RootVal, Args, TType, Context>;
  deprecationReason?: string;
  description?: string;
  extensions?: Readonly<
    GraphQLFieldExtensions<RootVal, Context, InferValueFromArgs<Args>>
  >;
};

export type InterfaceField<
  Args extends Record<string, Arg<any>>,
  Type extends OutputType<Context>,
  Context
> = {
  args?: Args;
  type: Type;
  deprecationReason?: string;
  description?: string;
  extensions?: Readonly<
    GraphQLFieldExtensions<any, any, InferValueFromArgs<Args>>
  >;
};

type FieldFuncResolve<
  RootVal,
  Args extends { [Key in keyof Args]: Arg<any, any> },
  Type extends OutputType<Context>,
  Key extends string,
  Context
> =
  // i think the solution below is kinda wrong and we actually want this whole thing to be wrapped in UnionToIntersection

  // the tuple is here because we _don't_ want this to be distributive
  // if this was distributive then it would optional when it should be required e.g.
  // types.object<{ id: string } | { id: boolean }>()({
  //   name: "Node",
  //   fields: {
  //     id: types.field({
  //       type: types.nonNull(types.ID),
  //     }),
  //   },
  // });
  // TODO: this check is incomplete, there are some more cases which graphql-js will handle like promises and functions
  // though tbh, maybe it's fine to be a little more explicit like that
  [RootVal] extends [
    {
      [K in Key]: InferValueFromOutputType<Type>;
    }
  ]
    ? {
        resolve?: FieldResolver<
          RootVal,
          SomeTypeThatIsntARecordOfArgs extends Args ? {} : Args,
          Type,
          Context
        >;
      }
    : {
        resolve: FieldResolver<
          RootVal,
          SomeTypeThatIsntARecordOfArgs extends Args ? {} : Args,
          Type,
          Context
        >;
      };

type FieldFuncArgs<
  RootVal,
  Args extends { [Key in keyof Args]: Arg<any, any> },
  Type extends OutputType<Context>,
  Key extends string,
  Context
> = {
  args?: Args;
  type: Type;
  deprecationReason?: string;
  description?: string;
  extensions?: Readonly<GraphQLFieldExtensions<RootVal, unknown>>;
} & FieldFuncResolve<RootVal, Args, Type, Key, Context>;

export type FieldFunc<Context> = <
  RootVal,
  Type extends OutputType<Context>,
  Key extends string,
  Args extends { [Key in keyof Args]: Arg<any, any> } = {}
>(
  field: FieldFuncArgs<RootVal, Args, Type, Key, Context>
) => Field<RootVal, Args, Type, Key, Context>;

function bindFieldToContext<Context>(): FieldFunc<Context> {
  return function field(field) {
    if (!field.type) {
      throw new Error("A type must be passed to types.field()");
    }
    return field as any;
  };
}

export type InterfaceToInterfaceFields<
  Interface extends InterfaceType<any, any, any>
> = Interface extends InterfaceType<any, infer Fields, any> ? Fields : never;

type InterfaceFieldToOutputField<
  RootVal,
  Context,
  TField extends InterfaceField<any, any, Context>,
  Key extends string
> = TField extends InterfaceField<infer Args, infer OutputType, Context>
  ? Field<RootVal, Args, OutputType, Key, Context>
  : never;

type InterfaceFieldsToOutputFields<
  RootVal,
  Context,
  Fields extends { [Key in keyof Fields]: InterfaceField<any, any, Context> }
> = {
  [Key in keyof Fields]: InterfaceFieldToOutputField<
    RootVal,
    Context,
    Fields[Key],
    Extract<Key, string>
  >;
};

type UnionToIntersection<T> = (T extends any ? (x: T) => any : never) extends (
  x: infer R
) => any
  ? R
  : never;

export type InterfacesToOutputFields<
  RootVal,
  Context,
  Interfaces extends readonly InterfaceType<RootVal, any, Context>[]
> = UnionToIntersection<
  InterfaceFieldsToOutputFields<
    RootVal,
    Context,
    InterfaceToInterfaceFields<Interfaces[number]>
  >
>;

export type ObjectTypeFunc<Context> = <
  RootVal
>(youOnlyNeedToPassATypeParameterToThisFunctionYouPassTheActualRuntimeArgsOnTheResultOfThisFunction?: {
  youOnlyNeedToPassATypeParameterToThisFunctionYouPassTheActualRuntimeArgsOnTheResultOfThisFunction: true;
}) => <
  Fields extends {
    [Key in keyof Fields]: Field<
      RootVal,
      any,
      any,
      Extract<Key, string>,
      Context
    >;
  } &
    InterfacesToOutputFields<RootVal, Context, Interfaces>,
  Interfaces extends readonly InterfaceType<RootVal, any, Context>[] = []
>(config: {
  name: string;
  fields: MaybeFunc<Fields>;
  description?: string;
  deprecationReason?: string;
  interfaces?: [...Interfaces];
  isTypeOf?: GraphQLIsTypeOfFn<unknown, Context>;
  extensions?: Readonly<GraphQLObjectTypeExtensions<RootVal, Context>>;
}) => ObjectType<RootVal, Context>;

function bindObjectTypeToContext<Context>(): ObjectTypeFunc<Context> {
  return function object() {
    return function objectInner(config) {
      return {
        kind: "object",
        name: config.name,
        graphQLType: new GraphQLObjectType({
          name: config.name,
          description: config.description,
          isTypeOf: config.isTypeOf,
          interfaces: config.interfaces?.map((x) => x.graphQLType),
          fields: () => {
            const fields =
              typeof config.fields === "function"
                ? config.fields()
                : config.fields;
            return buildFields(fields);
          },
          extensions: config.extensions,
        }),
        __rootVal: undefined as any,
        __context: undefined as any,
      };
    };
  };
}

function buildFields(
  fields: Record<
    string,
    Field<
      any,
      Record<string, Arg<InputType, any>>,
      OutputType<any>,
      string,
      any
    >
  >
): GraphQLFieldConfigMap<any, any> {
  return Object.fromEntries(
    Object.entries(fields).map(([key, val]) => [
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
              deprecationReason: val.deprecationReason,
            },
          ])
        ),
        extensions: val.extensions,
      },
    ])
  );
}

export type UnionType<RootVal, Context> = {
  kind: "union";
  __rootVal: RootVal;
  __context: (context: Context) => void;
  graphQLType: GraphQLUnionType;
};

export type UnionTypeFunc<Context> = <
  TObjectType extends ObjectType<any, Context>
>(config: {
  name: string;
  description?: string;
  types: TObjectType[];
  resolveType: (
    type: TObjectType["__rootVal"],
    context: Parameters<TObjectType["__context"]>[0],
    info: GraphQLResolveInfo,
    abstractType: GraphQLUnionType
  ) => string;
}) => UnionType<
  TObjectType["__rootVal"],
  Parameters<TObjectType["__context"]>[0]
>;

function bindUnionTypeToContext<Context>(): UnionTypeFunc<Context> {
  return function union(config) {
    return {
      kind: "union",
      graphQLType: new GraphQLUnionType({
        name: config.name,
        description: config.description,
        types: config.types.map((x) => x.graphQLType),
        resolveType: config.resolveType as any,
      }),
      __rootVal: undefined as any,
      __context: undefined as any,
    };
  };
}

export type FieldsFunc<Context> = <
  RootVal
>(youOnlyNeedToPassATypeParameterToThisFunctionYouPassTheActualRuntimeArgsOnTheResultOfThisFunction?: {
  youOnlyNeedToPassATypeParameterToThisFunctionYouPassTheActualRuntimeArgsOnTheResultOfThisFunction: true;
}) => <
  Fields extends {
    [Key in keyof Fields]: Field<
      RootVal,
      any,
      any,
      Extract<Key, string>,
      Context
    >;
  }
>(
  fields: Fields
) => Fields;

function bindFieldsToContext<Context>(): FieldsFunc<Context> {
  return function fields() {
    return function fieldsInner(fields) {
      return fields;
    };
  };
}

type InterfaceFieldFuncArgs<
  RootVal,
  Args extends { [Key in keyof Args]: Arg<any, any> },
  Type extends OutputType<Context>,
  Context
> = {
  args?: Args;
  type: Type;
  deprecationReason?: string;
  description?: string;
  extensions?: Readonly<GraphQLFieldExtensions<RootVal, unknown>>;
};

export type InterfaceFieldFunc<Context> = <
  RootVal,
  Type extends OutputType<Context>,
  Args extends { [Key in keyof Args]: Arg<any, any> } = {}
>(
  field: InterfaceFieldFuncArgs<RootVal, Args, Type, Context>
) => InterfaceField<Args, Type, Context>;

function bindInterfaceFieldToContext<Context>(): InterfaceFieldFunc<Context> {
  return function interfaceField(field) {
    return field as any;
  };
}

export type InterfaceType<
  RootVal,
  Fields extends Record<
    string,
    InterfaceField<any, OutputType<Context>, Context>
  >,
  Context
> = {
  kind: "interface";
  __rootVal: (rootVal: RootVal) => void;
  __context: (context: Context) => void;
  graphQLType: GraphQLInterfaceType;
  fields: () => Fields;
};

export type MaybeFunc<T> = T | (() => T);

export type InterfaceTypeFunc<Context> = <
  RootVal
>(youOnlyNeedToPassATypeParameterToThisFunctionYouPassTheActualRuntimeArgsOnTheResultOfThisFunction?: {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  youOnlyNeedToPassATypeParameterToThisFunctionYouPassTheActualRuntimeArgsOnTheResultOfThisFunction: true;
}) => <
  Fields extends {
    [Key in keyof Fields]: InterfaceField<any, OutputType<Context>, Context>;
  } &
    UnionToIntersection<InterfaceToInterfaceFields<Interfaces[number]>>,
  Interfaces extends readonly InterfaceType<RootVal, any, Context>[] = []
>(config: {
  name: string;
  description?: string;
  deprecationReason?: string;
  interfaces?: [...Interfaces];
  resolveType?: GraphQLTypeResolver<RootVal, Context>;
  fields: MaybeFunc<Fields>;
  extensions?: Readonly<GraphQLInterfaceTypeExtensions>;
}) => InterfaceType<RootVal, Fields, Context>;

function bindInterfaceTypeToContext<Context>(): InterfaceTypeFunc<Context> {
  return function interfaceType() {
    return function interfaceInner(config) {
      return {
        kind: "interface",
        graphQLType: new GraphQLInterfaceType({
          name: config.name,
          description: config.description,
          resolveType: config.resolveType,
          interfaces: config.interfaces?.map((x) => x.graphQLType),
          extensions: config.extensions,
          fields: () => {
            const fields =
              typeof config.fields === "function"
                ? config.fields()
                : config.fields;
            return buildFields(fields as any);
          },
        }),
        __rootVal: undefined as any,
        __context: undefined as any,
        fields: () =>
          typeof config.fields === "function" ? config.fields() : config.fields,
      };
    };
  };
}

export type TypesWithContext<Context> = {
  object: ObjectTypeFunc<Context>;
  union: UnionTypeFunc<Context>;
  field: FieldFunc<Context>;
  fields: FieldsFunc<Context>;
  interfaceField: InterfaceFieldFunc<Context>;
  interface: InterfaceTypeFunc<Context>;
};

export function bindTypesToContext<Context>(): TypesWithContext<Context> {
  return {
    object: bindObjectTypeToContext<Context>(),
    union: bindUnionTypeToContext<Context>(),
    field: bindFieldToContext<Context>(),
    fields: bindFieldsToContext<Context>(),
    interfaceField: bindInterfaceFieldToContext<Context>(),
    interface: bindInterfaceTypeToContext<Context>(),
  };
}
