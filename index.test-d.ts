import { expectType } from "tsd";
import {
  types,
  bindTypesToContext,
  Arg,
  InferValueFromInputType,
  InputObjectType,
  ScalarType,
} from "./packages/schema";

const typesWithContext = bindTypesToContext();

typesWithContext.arg({
  type: typesWithContext.Boolean,
});

const Something = types.inputObject({
  name: "Something",
  fields: {
    nullableString: types.arg({ type: types.String }),
    nullableStringWithDefaultValue: types.arg({
      type: types.String,
      defaultValue: "something",
    }),
    nonNullableString: types.arg({
      type: types.nonNull(types.String),
    }),
    nonNullableStringWithDefaultValue: types.arg({
      type: types.nonNull(types.String),
      defaultValue: "something",
    }),
  },
});

type SomethingType = InferValueFromInputType<typeof Something>;

declare const valOfSomethingType: SomethingType;

expectType<{
  readonly nullableString: string | null | undefined;
  readonly nullableStringWithDefaultValue: string | null;
  readonly nonNullableString: string;
  readonly nonNullableStringWithDefaultValue: string;
} | null>(valOfSomethingType);

type RecursiveInput = InputObjectType<{
  nullableString: Arg<ScalarType<string>, any>;
  recursive: Arg<RecursiveInput, any>;
}>;

const Recursive: RecursiveInput = types.inputObject({
  name: "Recursive",
  fields: () => ({
    nullableString: types.arg({ type: types.String }),
    recursive: types.arg({ type: Recursive }),
  }),
});

type RecursiveInputType = InferValueFromInputType<typeof Recursive>;

declare const valOfRecursiveInputType: RecursiveInputType;

type RecursiveTypeExpect = {
  readonly nullableString: string | null | undefined;
  readonly recursive: RecursiveTypeExpect | null | undefined;
} | null;

expectType<RecursiveTypeExpect>(valOfRecursiveInputType);

// TODO: if possible, this should error. not really a massive deal if it doesn't though tbh
// since if people forget to add something here, they will see an error when they try to read a field that doesn't exist
export const ExplicitDefinitionMissingFieldsThatAreSpecifiedInCalls: InputObjectType<{
  nullableString: Arg<typeof types.String>;
}> = types.inputObject({
  name: "ExplicitDefinitionMissingFieldsThatAreSpecifiedInCalls",
  fields: () => ({
    nullableString: types.arg({ type: types.String }),
    another: types.arg({ type: types.String }),
  }),
});

types.object<{ id: string } | { id: "str" }>()({
  name: "Node",
  fields: {
    id: types.field({
      type: types.nonNull(types.ID),
    }),
  },
});

types.object<{ id: string } | { id: boolean }>()({
  name: "Node",
  fields: {
    // @ts-expect-error
    id: types.field({
      type: types.nonNull(types.ID),
    }),
  },
});

// types.interface<{ kind: "one"; id: string } | { kind: "two"; id: boolean }>()({
//   name: "Node",
//   fields: {
//     id: types.field({
//       type: types.nonNull(types.ID),
//       // args: {},
//       resolve({}, {}) {
//         return true;
//       },
//     }),
//   },
// });
