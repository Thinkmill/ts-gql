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

const someEnum = types.enum({
  name: "SomeEnum",
  values: types.enumValues(["a", "b"]),
});

const enumArg = types.arg({
  type: someEnum,
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
    enum: enumArg,
  },
});

{
  type SomethingType = InferValueFromInputType<typeof Something>;

  const valOfSomethingType: SomethingType = undefined as any;

  expectType<{
    readonly nullableString: string | null | undefined;
    readonly nullableStringWithDefaultValue: string | null;
    readonly nonNullableString: string;
    readonly nonNullableStringWithDefaultValue: string;
    readonly enum: "a" | "b" | null | undefined;
  } | null>(valOfSomethingType);
}

{
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

  const valOfRecursiveInputType: RecursiveInputType = undefined as any;

  type RecursiveTypeExpect = {
    readonly nullableString: string | null | undefined;
    readonly recursive: RecursiveTypeExpect | null | undefined;
  } | null;

  expectType<RecursiveTypeExpect>(valOfRecursiveInputType);
}

{
  const nonRecursiveFields = {
    nullableString: types.arg({ type: types.String }),
  };

  type RecursiveInput = InputObjectType<
    typeof nonRecursiveFields & {
      recursive: Arg<RecursiveInput, any>;
    }
  >;

  const Recursive: RecursiveInput = types.inputObject({
    name: "Recursive",
    fields: () => ({
      ...nonRecursiveFields,
      recursive: types.arg({ type: Recursive }),
    }),
  });

  type RecursiveInputType = InferValueFromInputType<typeof Recursive>;

  const valOfRecursiveInputType: RecursiveInputType = undefined as any;

  type RecursiveTypeExpect = {
    readonly nullableString: string | null | undefined;
    readonly recursive: RecursiveTypeExpect | null | undefined;
  } | null;

  expectType<RecursiveTypeExpect>(valOfRecursiveInputType);
}

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

{
  const sharedFields = types.fields<{ something: string }>()({
    something: types.field({
      type: types.nonNull(types.String),
    }),
  });

  const sharedFieldsWithUnkownRootVal = types.fields()({
    other: types.field({
      type: types.nonNull(types.String),
      resolve() {
        return "";
      },
    }),
  });

  types.object<{ something: string; other: string }>()({
    name: "",
    fields: {
      ...sharedFields,
      ...sharedFieldsWithUnkownRootVal,
    },
  });

  types.object<{ other: string }>()({
    name: "",
    fields: sharedFieldsWithUnkownRootVal,
  });

  types.object<{ other: string }>()({
    name: "",
    // @ts-expect-error
    fields: sharedFields,
  });
}

{
  const typesWithContextA = bindTypesToContext<{ something: boolean }>();

  const typesWithContextB =
    bindTypesToContext<{ something: boolean; other: string }>();

  {
    typesWithContextB.object<{ thing: string }>()({
      name: "",
      fields: {
        thing: typesWithContextA.field({
          type: types.String,
        }),
      },
    });
    typesWithContextA.object<{ thing: string }>()({
      name: "",
      fields: {
        // @ts-expect-error
        thing: typesWithContextB.field({
          type: types.String,
        }),
      },
    });
  }

  {
    const fromA = typesWithContextA.object<{}>()({
      name: "Something",
      fields: {
        a: typesWithContextA.field({
          type: types.String,
          resolve(rootVal, args, context) {
            expectType<{ something: boolean }>(context);
            return "";
          },
        }),
      },
    });
    const fromBWithA = typesWithContextB.object()({
      name: "Other",
      fields: {
        a: typesWithContextB.field({
          type: fromA,
          resolve(rootVal, args, context) {
            expectType<{ something: boolean; other: string }>(context);
            return {};
          },
        }),
      },
    });
    typesWithContextA.object<{}>()({
      name: "Something",
      fields: {
        a: typesWithContextA.field({
          // @ts-expect-error
          type: fromBWithA,
          resolve(rootVal, args, context) {
            expectType<{ something: boolean }>(context);
          },
        }),
      },
    });
    typesWithContextA.object<{}>()({
      name: "Something",
      fields: {
        a: typesWithContextA.field({
          // @ts-expect-error
          type: types.list(fromBWithA),
          resolve(rootVal, args, context) {
            expectType<{ something: boolean }>(context);
          },
        }),
      },
    });
    typesWithContextA.object<{}>()({
      name: "Something",
      fields: {
        a: typesWithContextA.field({
          // @ts-expect-error
          type: types.list(types.list(fromBWithA)),
          resolve(rootVal, args, context) {
            expectType<{ something: boolean }>(context);
          },
        }),
      },
    });
    typesWithContextA.object<{}>()({
      name: "Something",
      fields: {
        a: typesWithContextA.field({
          // @ts-expect-error
          type: types.nonNull(fromBWithA),
          resolve(rootVal, args, context) {
            expectType<{ something: boolean }>(context);
          },
        }),
      },
    });
    typesWithContextA.object<{}>()({
      name: "Something",
      fields: {
        a: typesWithContextA.field({
          // @ts-expect-error
          type: types.list(types.nonNull(fromBWithA)),
          resolve(rootVal, args, context) {
            expectType<{ something: boolean }>(context);
          },
        }),
      },
    });
  }
}

{
  const nonNullThing = types.nonNull(types.String);
  types.nonNull(
    // @ts-expect-error
    nonNullThing
  );
}
