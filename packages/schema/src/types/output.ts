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
} from "./types-that-do-not-use-context";

// TODO: once interfaces and unions are implemented, the requiring/not requiring of isTypeOf/resolveType:
// if resolveType is implemented on every interface that an object implements, the object type does not need to implement isTypeOf
// if isTypeOf is implemented on every member of a union, the union does not need to implement resolveType

type OutputListType<Of extends OutputTypes> = {
  kind: "list";
  of: Of;
  graphQLType: GraphQLList<Of["graphQLType"]>;
};

type OutputNonNullType<Of extends OutputTypeExcludingNonNull> = {
  kind: "non-null";
  of: Of;
  graphQLType: GraphQLNonNull<Of["graphQLType"]>;
};

type OutputListTypeWithContext<Context> = {
  kind: "list";
  of: OutputTypes<Context>;
  graphQLType: GraphQLList<any>;
};

type OutputNonNullTypeWithContext<Context> = {
  kind: "non-null";
  of: OutputTypeExcludingNonNull<Context>;
  graphQLType: GraphQLNonNull<
    OutputTypeExcludingNonNull<Context>["graphQLType"]
  >;
};

export type OutputTypeExcludingNonNull<Context = unknown> =
  | ScalarType<any>
  | ObjectType<any, string, Context>
  | UnionType<ObjectType<any, string, Context>>
  | EnumType<any>
  | OutputListTypeWithContext<Context>;

export type OutputTypes<Context = unknown> =
  | OutputTypeExcludingNonNull<Context>
  | OutputNonNullTypeWithContext<Context>;

type InferValueFromOutputTypeWithoutAddingNull<Type extends OutputTypes> =
  Type extends ScalarType<infer Value>
    ? Value
    : Type extends EnumType<infer Values>
    ? Values[keyof Values]["value"]
    : Type extends OutputListType<infer Value>
    ? InferValueFromOutputType<Value>[]
    : Type extends ObjectType<infer RootVal, string, any>
    ? RootVal
    : Type extends UnionType<ObjectType<infer RootVal, string, any>>
    ? RootVal
    : never;

export type InferValueFromOutputType<Type extends OutputTypes<any>> =
  Type extends OutputNonNullType<infer Value>
    ? InferValueFromOutputTypeWithoutAddingNull<Value>
    : InferValueFromOutputTypeWithoutAddingNull<Type> | null;

export type ObjectType<RootVal, Name extends string, Context> = {
  kind: "object";
  name: Name;
  graphQLType: GraphQLObjectType;
  __context: (context: Context) => void;
  __rootVal: RootVal;
};

type MaybePromise<T> = Promise<T> | T;

export type OutputFieldResolver<
  Args extends Record<string, Arg<any>>,
  OutputType extends OutputTypes<Context>,
  RootVal,
  Context
> = (
  rootVal: RootVal,
  args: InferValueFromArgs<Args>,
  context: Context,
  info: GraphQLResolveInfo
) => MaybePromise<InferValueFromOutputType<OutputType>>;

type SomeTypeThatIsntARecordOfArgs = string;

export type OutputField<
  RootVal,
  Args extends Record<string, Arg<any>>,
  OutputType extends OutputTypes<Context>,
  Key extends string,
  Context
> = {
  args?: Args;
  type: OutputType;
  __key: Key;
  __rootVal: (rootVal: RootVal) => void;
  __context: (context: Context) => void;
  resolve?: OutputFieldResolver<Args, OutputType, RootVal, Context>;
  deprecationReason?: string;
  description?: string;
  extensions?: Readonly<
    GraphQLFieldExtensions<RootVal, Context, InferValueFromArgs<Args>>
  >;
};

export type InterfaceField<
  Args extends Record<string, Arg<any>>,
  OutputType extends OutputTypes<Context>,
  Context
> = {
  args?: Args;
  type: OutputType;
  deprecationReason?: string;
  description?: string;
  extensions?: Readonly<
    GraphQLFieldExtensions<any, any, InferValueFromArgs<Args>>
  >;
};

export const field = bindFieldToContext<unknown>();

type FieldFuncResolve<
  RootVal,
  Args extends { [Key in keyof Args]: Arg<any, any> },
  OutputType extends OutputTypes<Context>,
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
      [K in Key]: InferValueFromOutputType<OutputType>;
    }
  ]
    ? {
        resolve?: OutputFieldResolver<
          SomeTypeThatIsntARecordOfArgs extends Args ? {} : Args,
          OutputType,
          RootVal,
          Context
        >;
      }
    : {
        resolve: OutputFieldResolver<
          SomeTypeThatIsntARecordOfArgs extends Args ? {} : Args,
          OutputType,
          RootVal,
          Context
        >;
      };

type FieldFuncArgs<
  RootVal,
  Args extends { [Key in keyof Args]: Arg<any, any> },
  OutputType extends OutputTypes<Context>,
  Key extends string,
  Context
> = {
  args?: Args;
  type: OutputType;
  deprecationReason?: string;
  description?: string;
  extensions?: Readonly<GraphQLFieldExtensions<RootVal, unknown>>;
} & FieldFuncResolve<RootVal, Args, OutputType, Key, Context>;

type FieldFunc<Context> = <
  RootVal,
  OutputType extends OutputTypes<Context>,
  Key extends string,
  Args extends { [Key in keyof Args]: Arg<any, any> } = {}
>(
  field: FieldFuncArgs<RootVal, Args, OutputType, Key, Context>
) => OutputField<RootVal, Args, OutputType, Key, Context>;

function bindFieldToContext<Context>(): FieldFunc<Context> {
  return function field(field) {
    return field as any;
  };
}

type InterfaceToInterfaceFields<
  Interface extends InterfaceType<any, any, any>
> = Interface extends InterfaceType<any, any, infer Fields> ? Fields : never;

type InterfaceFieldsToOutputFields<
  RootVal,
  Context,
  Fields extends { [Key in keyof Fields]: InterfaceField<any, any, Context> }
> = {
  [Key in keyof Fields]: OutputField<
    RootVal,
    Fields[Key]["args"],
    Fields[Key]["type"],
    Extract<Key, string>,
    Context
  >;
};

type UnionToIntersection<T> = (T extends any ? (x: T) => any : never) extends (
  x: infer R
) => any
  ? R
  : never;

type InterfacesToOutputFields<
  RootVal,
  Context,
  Interfaces extends readonly InterfaceType<RootVal, Context, any>[]
> = UnionToIntersection<
  InterfaceFieldsToOutputFields<
    RootVal,
    Context,
    InterfaceToInterfaceFields<Interfaces[number]>
  >
>;

export const object = bindObjectTypeToContext<unknown>();

type ObjectTypeFunc<Context> = <
  RootVal
>(youOnlyNeedToPassATypeParameterToThisFunctionYouPassTheActualRuntimeArgsOnTheResultOfThisFunction?: {
  youOnlyNeedToPassATypeParameterToThisFunctionYouPassTheActualRuntimeArgsOnTheResultOfThisFunction: true;
}) => <
  Name extends string,
  Fields extends {
    [Key in keyof Fields]: OutputField<
      RootVal,
      any,
      any,
      Extract<Key, string>,
      Context
    >;
  } &
    InterfacesToOutputFields<RootVal, Context, Interfaces>,
  Interfaces extends readonly InterfaceType<RootVal, Context, any>[] = []
>(config: {
  name: Name;
  fields: MaybeFunc<Fields>;
  description?: string;
  deprecationReason?: string;
  interfaces?: [...Interfaces];
  isTypeOf?: GraphQLIsTypeOfFn<unknown, Context>;
  extensions?: Readonly<GraphQLObjectTypeExtensions<RootVal, Context>>;
}) => ObjectType<RootVal, Name, Context>;

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
    OutputField<
      any,
      Record<string, Arg<InputType, any>>,
      OutputTypes,
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
            },
          ])
        ),
        extensions: val.extensions,
      },
    ])
  );
}

export type UnionType<TObjectType extends ObjectType<any, string, any>> = {
  kind: "union";
  __rootVal: TObjectType["__rootVal"];
  __context: TObjectType["__context"];
  graphQLType: GraphQLUnionType;
};

export const union = bindUnionTypeToContext<unknown>();

type UnionTypeFunc<Context> = <
  TObjectType extends ObjectType<any, string, Context>
>(config: {
  name: string;
  description?: string;
  types: TObjectType[];
  resolveType: (
    type: TObjectType["__rootVal"],
    context: Parameters<TObjectType["__context"]>[0],
    info: GraphQLResolveInfo,
    abstractType: GraphQLUnionType
  ) => TObjectType["name"];
}) => UnionType<TObjectType>;

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

type FieldsTypeFunc<Context> = <
  RootVal
>(youOnlyNeedToPassATypeParameterToThisFunctionYouPassTheActualRuntimeArgsOnTheResultOfThisFunction?: {
  youOnlyNeedToPassATypeParameterToThisFunctionYouPassTheActualRuntimeArgsOnTheResultOfThisFunction: true;
}) => <
  Fields extends {
    [Key in keyof Fields]: OutputField<
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

function bindFieldsToContext<Context>(): FieldsTypeFunc<Context> {
  return function fields() {
    return function fieldsInner(fields) {
      return fields;
    };
  };
}

export const fields = bindFieldsToContext<unknown>();

type InterfaceFieldFuncArgs<
  RootVal,
  Args extends { [Key in keyof Args]: Arg<any, any> },
  OutputType extends OutputTypes<Context>,
  Context
> = {
  args?: Args;
  type: OutputType;
  deprecationReason?: string;
  description?: string;
  extensions?: Readonly<GraphQLFieldExtensions<RootVal, unknown>>;
};

type InterfaceFieldFunc<Context> = <
  RootVal,
  OutputType extends OutputTypes<Context>,
  Args extends { [Key in keyof Args]: Arg<any, any> } = {}
>(
  field: InterfaceFieldFuncArgs<RootVal, Args, OutputType, Context>
) => InterfaceField<Args, OutputType, Context>;

function bindInterfaceFieldToContext<Context>(): InterfaceFieldFunc<Context> {
  return function interfaceField(field) {
    return field as any;
  };
}

export const interfaceField = bindInterfaceFieldToContext<unknown>();

export type InterfaceType<
  RootVal,
  Context,
  Fields extends {
    [Key in keyof Fields]: InterfaceField<any, any, Context>;
  }
  // Interfaces extends InterfaceType<
  //   any,
  //   Context,
  //   Record<string, OutputField<RootVal, any, any, string, Context>>,
  //   any[]
  // >[]
> = {
  kind: "interface";
  __rootVal: (rootVal: RootVal) => void;
  __context: (context: Context) => void;
  graphQLType: GraphQLInterfaceType;
  fields: () => Fields;
};

const interfaceType = bindInterfaceTypeToContext<unknown>();

export type MaybeFunc<T> = T | (() => T);

export { interfaceType as interface };
function bindInterfaceTypeToContext<Context>() {
  return function interfaceType<RootVal>(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    youOnlyNeedToPassATypeParameterToThisFunctionYouPassTheActualRuntimeArgsOnTheResultOfThisFunction?: {
      youOnlyNeedToPassATypeParameterToThisFunctionYouPassTheActualRuntimeArgsOnTheResultOfThisFunction: true;
    }
  ) {
    return function interfaceInner<
      Fields extends {
        [Key in keyof Fields]: InterfaceField<
          any,
          OutputTypes<Context>,
          Context
        >;
      } &
        UnionToIntersection<InterfaceToInterfaceFields<Interfaces[number]>>,
      Interfaces extends readonly InterfaceType<RootVal, Context, any>[] = []
    >(config: {
      name: string;
      description?: string;
      deprecationReason?: string;
      interfaces?: [...Interfaces];
      resolveType?: GraphQLTypeResolver<RootVal, Context>;
      fields: MaybeFunc<Fields>;
      extensions?: Readonly<GraphQLInterfaceTypeExtensions>;
    }): InterfaceType<RootVal, Context, Fields> {
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

import * as typesThatDoNotUseContext from "./types-that-do-not-use-context";

export function bindTypesToContext<Context>() {
  return {
    ...typesThatDoNotUseContext,
    object: bindObjectTypeToContext<Context>(),
    union: bindUnionTypeToContext<Context>(),
    field: bindFieldToContext<Context>(),
    fields: bindFieldsToContext<Context>(),
    interfaceField: bindInterfaceFieldToContext<Context>(),
    interface: bindInterfaceTypeToContext<Context>(),
  };
}
