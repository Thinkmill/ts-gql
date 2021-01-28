import { expectType } from "tsd";
import { types } from ".";

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
