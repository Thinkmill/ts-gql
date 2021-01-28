import { expectType } from "tsd";
import { types } from "./packages/schema/src";

const Something = types.inputObject({
  name: "Something",
  fields: {
    nullableString: types.arg({ type: types.scalars.String }),
    nullableStringWithDefaultValue: types.arg({
      type: types.scalars.String,
      defaultValue: "something",
    }),
    nonNullableString: types.arg({
      type: types.nonNullable(types.scalars.String),
    }),
    nonNullableStringWithDefaultValue: types.arg({
      type: types.nonNullable(types.scalars.String),
      defaultValue: "something",
    }),
  },
});

type SomethingType = types.InferValueFromInputType<typeof Something>;

declare const valOfSomethingType: SomethingType;

expectType<{
  readonly nullableString: string | null | undefined;
  readonly nullableStringWithDefaultValue: string | null;
  readonly nonNullableString: string;
  readonly nonNullableStringWithDefaultValue: string;
} | null>(valOfSomethingType);

type RecursiveInput = types.InputObject<{
  nullableString: types.Arg<typeof types.scalars.String>;
  recursive: types.Arg<RecursiveInput>;
}>;

const Recursive: RecursiveInput = types.inputObject({
  name: "Recursive",
  fields: () => ({
    nullableString: types.arg({ type: types.scalars.String }),
    recursive: types.arg({ type: Recursive }),
  }),
});

type RecursiveInputType = types.InferValueFromInputType<typeof Recursive>;

declare const valOfRecursiveInputType: RecursiveInputType;

type RecursiveTypeExpect = {
  readonly nullableString: string | null | undefined;
  readonly recursive: RecursiveTypeExpect | null | undefined;
} | null;

expectType<RecursiveTypeExpect>(valOfRecursiveInputType);

// TODO: if possible, this should error. not really a massive deal if it doesn't though tbh
// since if people forget to add something here, they will see an error when they try to read a field that doesn't exist
export const ExplicitDefinitionMissingFieldsThatAreSpecifiedInCalls: types.InputObject<{
  nullableString: types.Arg<typeof types.scalars.String>;
}> = types.inputObject({
  name: "ExplicitDefinitionMissingFieldsThatAreSpecifiedInCalls",
  fields: () => ({
    nullableString: types.arg({ type: types.scalars.String }),
    another: types.arg({ type: types.scalars.String }),
  }),
});
