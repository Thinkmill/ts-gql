import * as tsgqlSchema from ".";
export * from "./types-without-context";
export {
  field,
  fields,
  interface,
  interfaceField,
  object,
  union,
} from "./types-with-context";

export type Context = unknown;

export type NullableType = tsgqlSchema.NullableType<Context>;
export type Type = tsgqlSchema.Type<Context>;
export type NullableOutputType = tsgqlSchema.NullableOutputType<Context>;
export type OutputType = tsgqlSchema.OutputType<Context>;
export type Field<
  RootVal,
  Args extends Record<string, tsgqlSchema.Arg<any>>,
  TType extends OutputType,
  Key extends string
> = tsgqlSchema.Field<RootVal, Args, TType, Key, Context>;
export type FieldResolver<
  RootVal,
  Args extends Record<string, tsgqlSchema.Arg<any>>,
  TType extends OutputType
> = tsgqlSchema.FieldResolver<RootVal, Args, TType, Context>;
export type ObjectType<RootVal> = tsgqlSchema.ObjectType<RootVal, Context>;
export type UnionType<RootVal> = tsgqlSchema.UnionType<RootVal, Context>;
export type InterfaceType<
  RootVal,
  Fields extends Record<
    string,
    tsgqlSchema.InterfaceField<any, OutputType, Context>
  >
> = tsgqlSchema.InterfaceType<RootVal, Fields, Context>;
export type InterfaceField<
  Args extends Record<string, tsgqlSchema.Arg<any>>,
  TType extends OutputType
> = tsgqlSchema.InterfaceField<Args, TType, Context>;
