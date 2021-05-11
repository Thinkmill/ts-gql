import {
  GraphQLInputObjectType,
  GraphQLInputType,
  GraphQLList,
  GraphQLNonNull,
} from "graphql/type/definition";
import { EnumType } from "./enum";
import { ScalarType } from "./scalars";

type InputListType<Of extends InputType> = {
  kind: "list";
  of: Of;
  graphQLType: GraphQLList<any>;
  __context: any;
};

type InputNonNullType<Of extends InputTypeExcludingNonNull> = {
  kind: "non-null";
  of: Of;
  graphQLType: GraphQLNonNull<any>;
  __context: any;
};

export type InputTypeExcludingNonNull =
  | ScalarType<any>
  | InputObjectType<any>
  | InputListType<any>
  | EnumType<any>;

export type InputType = InputTypeExcludingNonNull | InputNonNullType<any>;

type InferValueFromInputTypeWithoutAddingNull<Type extends InputType> =
  Type extends ScalarType<infer Value>
    ? Value
    : Type extends EnumType<infer Values>
    ? Values[keyof Values]["value"]
    : Type extends InputListType<infer Value>
    ? InferValueFromInputType<Value>[]
    : Type extends InputObjectType<infer Fields>
    ? {
        readonly [Key in keyof Fields]: InferValueFromArg<Fields[Key]>;
      }
    : never;

export type InferValueFromArgs<Args extends Record<string, Arg<any, any>>> = {
  readonly [Key in keyof Args]: InferValueFromArg<Args[Key]>;
};

export type InferValueFromArg<TArg extends Arg<any, any>> =
  | InferValueFromInputType<TArg["type"]>
  | ("non-null" extends TArg["type"]["kind"]
      ? never
      : undefined extends TArg["defaultValue"]
      ? undefined
      : never);

export type InferValueFromInputType<Type extends InputType> =
  Type extends InputNonNullType<infer Value>
    ? InferValueFromInputTypeWithoutAddingNull<Value>
    : InferValueFromInputTypeWithoutAddingNull<Type> | null;

// export type InferValueFromInputType<Type extends InputType> =
//   | InferValueFromInputTypeWithoutAddingNull<Type>
//   | ("non-null" extends Type["kind"] ? never : null);

export type InputObjectType<
  Fields extends {
    [Key in keyof any]: Arg<InputType, InferValueFromInputType<InputType>>;
  }
> = {
  kind: "input";
  __fields: Fields;
  __context: unknown;
  graphQLType: GraphQLInputObjectType;
};

export type Arg<
  Type extends InputType,
  DefaultValue extends InferValueFromInputType<Type> | undefined = undefined
> = {
  type: Type;
  description?: string;
  defaultValue?: DefaultValue;
} & (undefined extends DefaultValue ? {} : { defaultValue: DefaultValue });

export function arg<
  Type extends InputType,
  DefaultValue extends InferValueFromInputType<Type> | undefined
>(arg: Arg<Type, DefaultValue>): Arg<Type, DefaultValue> {
  return arg;
}

export function inputObject<
  Fields extends {
    [Key in keyof any]: Arg<InputType, InferValueFromInputType<InputType>>;
  }
>(config: {
  name: string;
  description?: string;
  fields: (() => Fields) | Fields;
}): InputObjectType<Fields> {
  const fields = config.fields;
  const graphQLType = new GraphQLInputObjectType({
    name: config.name,
    description: config.description,
    fields: () => {
      return Object.fromEntries(
        Object.entries(typeof fields === "function" ? fields() : fields).map(
          ([key, value]) =>
            [
              key,
              {
                description: value.description,
                type: value.type.graphQLType as GraphQLInputType,
                defaultValue: value.defaultValue,
              },
            ] as const
        )
      );
    },
  });
  return {
    kind: "input",
    __fields: undefined as any,
    __context: undefined,
    graphQLType,
  };
}
