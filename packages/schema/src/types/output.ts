import {
  GraphQLFieldConfigMap,
  GraphQLFieldExtensions,
  GraphQLInputType,
  GraphQLList,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLResolveInfo,
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
  graphQLType: GraphQLList<Of["graphQLType"]>;
};

export type OutputTypeExcludingNonNull =
  | ScalarType<any>
  | ObjectType<any, string, any>
  | UnionType<ObjectType<any, string, any>>
  | EnumType<any>
  | OutputListType<any>;

export type OutputTypes = OutputTypeExcludingNonNull | OutputNonNullType<any>;

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

export type InferValueFromOutputType<Type extends OutputTypes> =
  Type extends OutputNonNullType<infer Value>
    ? InferValueFromOutputTypeWithoutAddingNull<Value>
    : InferValueFromOutputTypeWithoutAddingNull<Type> | null;

export type ObjectType<RootVal, Name extends string, Context> = {
  kind: "object";
  name: Name;
  graphQLType: GraphQLObjectType;
  __context: Context;
  __rootVal: RootVal;
};

type MaybePromise<T> = Promise<T> | T;

export type OutputFieldResolver<
  Args extends Record<string, Arg<any>>,
  OutputType extends OutputTypes,
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
  OutputType extends OutputTypes,
  Key extends string,
  Context
> = {
  args?: Args;
  type: OutputType;
  __key: Key;
  __rootVal: RootVal;
  __context: Context;
  resolve?: OutputFieldResolver<Args, OutputType, RootVal, Context>;
  deprecationReason?: string;
  description?: string;
  extensions?: Readonly<GraphQLFieldExtensions<RootVal, unknown>>;
};

export const field = bindFieldToContext<unknown>();

type FieldFuncResolve<
  RootVal,
  Args extends { [Key in keyof Args]: Arg<any, any> },
  OutputType extends OutputTypes,
  Key extends string,
  Context
> =
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
  OutputType extends OutputTypes,
  Key extends string,
  Context
> = {
  args?: Args;
  type: OutputType;
  deprecationReason?: string;
  description?: string;
  extensions?: Readonly<GraphQLFieldExtensions<RootVal, unknown>>;
} & FieldFuncResolve<RootVal, Args, OutputType, Key, Context>;

type FieldFunc<OuterContext> = <
  RootVal,
  Args extends { [Key in keyof Args]: Arg<any, any> },
  OutputType extends OutputTypes,
  Key extends string,
  Context extends OuterContext
>(
  field: FieldFuncArgs<RootVal, Args, OutputType, Key, Context>
) => OutputField<RootVal, Args, OutputType, Key, Context>;

function bindFieldToContext<OuterContext>(): FieldFunc<OuterContext> {
  return function field(field) {
    return field as any;
  };
}

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
  }
>(config: {
  name: Name;
  description?: string;
  deprecationReason?: string;
  fields: Fields | (() => Fields);
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
          fields: () => {
            const fields =
              typeof config.fields === "function"
                ? config.fields()
                : config.fields;
            return buildFields(fields);
          },
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
    context: TObjectType["__context"],
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

// export type InterfaceType<
//   RootVal,
//   Context,
//   Fields extends {
//     [Key in keyof Fields]: OutputField<
//       RootVal,
//       any,
//       any,
//       Extract<Key, string>,
//       Context
//     >;
//   },
//   Interfaces extends InterfaceType<
//     any,
//     Context,
//     Record<string, OutputField<RootVal, any, any, string, Context>>,
//     any[]
//   >[]
// > = {
//   kind: "interface";
//   __rootVal: RootVal;
//   __context: Context;
//   graphQLType: GraphQLInterfaceType;
//   fields: () => Fields &
//     (never extends Interfaces[number]["fields"]
//       ? {}
//       : Interfaces[number]["fields"]);
// };

// const interfaceType = bindInterfaceTypeToContext<unknown>();

// export { interfaceType as interface };
// function bindInterfaceTypeToContext<Context>() {
//   return function interfaceType<RootVal>(
//     // eslint-disable-next-line @typescript-eslint/no-unused-vars
//     youOnlyNeedToPassATypeParameterToThisFunctionYouPassTheActualRuntimeArgsOnTheResultOfThisFunction?: {
//       youOnlyNeedToPassATypeParameterToThisFunctionYouPassTheActualRuntimeArgsOnTheResultOfThisFunction: true;
//     }
//   ) {
//     return function interfaceInner<
//       Fields extends {
//         [Key in keyof Fields]: OutputField<
//           RootVal,
//           any,
//           any,
//           Extract<Key, string>,
//           Context
//         >;
//       }
//     >(config: {
//       name: string;
//       description?: string;
//       deprecationReason?: string;
//       fields: Fields | (() => Fields);
//     }): InterfaceType<RootVal, Context, Fields, []> {
//       return {
//         kind: "interface",
//         graphQLType: new GraphQLInterfaceType({
//           name: config.name,
//           description: config.description,
//           fields: () => {
//             const fields =
//               typeof config.fields === "function"
//                 ? config.fields()
//                 : config.fields;
//             return buildFields(fields);
//           },
//         }),
//         __rootVal: undefined as any,
//         __context: undefined as any,
//         fields: () =>
//           typeof config.fields === "function" ? config.fields() : config.fields,
//       };
//     };
//   };
// }

import * as typesThatDoNotUseContext from "./types-that-do-not-use-context";

export function bindTypesToContext<Context>() {
  return {
    ...typesThatDoNotUseContext,
    object: bindObjectTypeToContext<Context>(),
    union: bindUnionTypeToContext<Context>(),
    field: bindFieldToContext<Context>(),
  };
}
