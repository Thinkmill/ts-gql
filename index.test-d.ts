import { expectType } from "tsd";
import { types, bindTypesToContext } from "./packages/schema";

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

type SomethingType = types.InferValueFromInputType<typeof Something>;

declare const valOfSomethingType: SomethingType;

expectType<{
  readonly nullableString: string | null | undefined;
  readonly nullableStringWithDefaultValue: string | null;
  readonly nonNullableString: string;
  readonly nonNullableStringWithDefaultValue: string;
} | null>(valOfSomethingType);

type RecursiveInput = types.InputObjectType<{
  nullableString: types.Arg<types.String>;
  recursive: types.Arg<RecursiveInput>;
}>;

const Recursive: RecursiveInput = types.inputObject({
  name: "Recursive",
  fields: () => ({
    nullableString: types.arg({ type: types.String }),
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
export const ExplicitDefinitionMissingFieldsThatAreSpecifiedInCalls: types.InputObjectType<{
  nullableString: types.Arg<typeof types.String>;
}> = types.inputObject({
  name: "ExplicitDefinitionMissingFieldsThatAreSpecifiedInCalls",
  fields: () => ({
    nullableString: types.arg({ type: types.String }),
    another: types.arg({ type: types.String }),
  }),
});
