import {
  GraphQLInputObjectType,
  GraphQLInputType,
  GraphQLNullableType,
  GraphQLType,
} from "graphql";
import { Enum, List, NonNull } from ".";
import { ScalarType } from "./scalars";

// note that list and non-null are written directly here because of circular reference things
export type InputTypeExcludingNonNull =
  | ScalarType<any>
  | InputObject<any>
  | {
      kind: "list";
      of: InputType;
      graphQLType: GraphQLType;
    }
  | Enum<any>;

export type InputType =
  | InputTypeExcludingNonNull
  | {
      kind: "non-null";
      of: InputTypeExcludingNonNull;
      graphQLType: GraphQLNullableType;
    };

type InferValueFromInputTypeWithoutAddingNull<
  Type extends InputType
> = Type extends ScalarType<infer Value>
  ? Value
  : Type extends Enum<infer Values>
  ? Values[string]["value"]
  : Type extends List<infer Value>
  ? // TODO: remove the need for this conditional
    Value extends InputType
    ? InferValueFromInputType<Value>[]
    : never
  : Type extends InputObject<infer Fields>
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

export type InferValueFromInputType<
  Type extends InputType
> = Type extends NonNull<infer Value>
  ? // TODO: remove the need for this conditional
    Value extends InputType
    ? InferValueFromInputTypeWithoutAddingNull<Value>
    : never
  : InferValueFromInputTypeWithoutAddingNull<Type> | null;

export type InputObject<
  Fields extends {
    [Key in keyof any]: Arg<InputType, InferValueFromInputType<InputType>>;
  }
> = {
  kind: "input";
  __fields: Fields;
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
}): InputObject<Fields> {
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
  return { kind: "input", __fields: undefined as any, graphQLType };
}
