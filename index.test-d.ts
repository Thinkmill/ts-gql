import { expectType } from "tsd";
import {
  types,
  bindTypesToContext,
  Arg,
  InferValueFromInputType,
  InputObjectType,
  ScalarType,
  InferValueFromOutputType,
} from "./packages/schema";
import * as typesWithContext from "./test-types-with-context";

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

{
  const types = {
    ...typesWithContext,
    ...bindTypesToContext<{ isAdminUIBuildProcess: true }>(),
  };

  const SomeOutput = types.object<{ thing: boolean }>()({
    name: "Something",
    fields: {
      thing: types.field({ type: types.nonNull(types.Boolean) }),
    },
  });

  const nonNullSomeOutput = types.nonNull(SomeOutput);

  type OutputTypeWithNull = InferValueFromOutputType<typeof SomeOutput>;

  expectType<OutputTypeWithNull>({ thing: true });
  expectType<OutputTypeWithNull>(null);

  type OutputTypeWithoutNull = InferValueFromOutputType<
    typeof nonNullSomeOutput
  >;

  expectType<OutputTypeWithoutNull>({ thing: true });

  types.field({
    type: SomeOutput,
    resolve() {
      if (Math.random() > 0.5) {
        return null;
      }
      return { thing: false };
    },
  });

  types.field({
    type: types.nonNull(types.list(nonNullSomeOutput)),
    resolve() {
      return [{ thing: false }];
    },
  });

  type FieldIdentifier = { listKey: string; fieldPath: string };

  types.fields<{ path: string; listKey: string }>()({
    thing: types.field({
      resolve(rootVal) {
        return { fieldPath: rootVal.path, listKey: rootVal.listKey };
      },
      type: types.nonNull(
        types.object<FieldIdentifier>()({
          name: "KeystoneAdminUIFieldMetaListView",
          fields: {
            fieldMode: types.field({
              type: types.nonNull(
                types.enum({
                  name: "KeystoneAdminUIFieldMetaListViewFieldMode",
                  values: types.enumValues(["read", "hidden"]),
                })
              ),
              async resolve(rootVal, args, context) {
                return "read" as const;
              },
            }),
          },
        })
      ),
    }),
  });
}

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

{
  const Node = types.interface()({
    name: "Node",
    fields: {
      id: types.interfaceField({ type: types.ID }),
    },
  });

  types.object<{ id: string }>()({
    name: "NodeImpl",
    interfaces: [Node],
    fields: { id: types.field({ type: types.ID }) },
  });

  types.object<{ thing: string }>()({
    name: "NodeImpl",
    interfaces: [Node],
    // @ts-expect-error
    fields: {},
  });

  types.object<{ thing: string }>()({
    name: "NodeImpl",
    interfaces: [Node],
    // @ts-expect-error
    fields: {
      thing: types.field({ type: types.ID }),
    },
  });
  types.object<{ id: number }>()({
    name: "NodeImpl",
    interfaces: [Node],
    fields: {
      // @ts-expect-error
      id: types.field({ type: types.Int }),
    },
  });
  types.object<{ id: number }>()({
    name: "NodeImpl",
    interfaces: [Node],
    fields: {
      // @ts-expect-error
      id: types.field({ type: types.ID }),
    },
  });

  {
    const NodeAnother = types.interface()({
      name: "Node",
      fields: {
        id: types.interfaceField({ type: types.Int }),
      },
    });

    types.object<{ id: string }>()({
      name: "NodeImpl",
      interfaces: [Node, NodeAnother],
      fields: {
        // @ts-expect-error
        id: types.field({ type: types.ID }),
      },
    });
  }

  types.interface()({
    name: "Node",
    interfaces: [Node],
    // @ts-expect-error
    fields: {},
  });

  {
    const Other = types.interface()({
      name: "Node",
      fields: { something: types.interfaceField({ type: types.Int }) },
    });
    types.object<{ id: string; something: number }>()({
      name: "NodeImpl",
      interfaces: [Node, Other],
      fields: {
        id: types.field({ type: types.ID }),
        something: types.field({ type: types.Int }),
      },
    });
    types.object<{ id: string }>()({
      name: "NodeImpl",
      interfaces: [Node, Other],
      // @ts-expect-error
      fields: {
        id: types.field({ type: types.ID }),
      },
    });
  }
}

types.object()({
  name: "Something",
  fields: {
    id: types.field({
      type: types.ID,
      resolve(rootVal, args) {
        // @ts-expect-error
        args.something;
        return "";
      },
    }),
  },
});

{
  type ImageMode = "local";

  type ImageExtension = "jpg" | "png" | "webp" | "gif";

  const SUPPORTED_IMAGE_EXTENSIONS = ["jpg", "png", "webp", "gif"] as const;

  const ImageExtensionEnum = types.enum({
    name: "ImageExtension",
    values: types.enumValues(SUPPORTED_IMAGE_EXTENSIONS),
  });

  type ImageData = {
    mode: ImageMode;
    id: string;
    extension: ImageExtension;
    filesize: number;
    width: number;
    height: number;
  };
  const imageOutputFields = types.fields<ImageData>()({
    id: types.field({ type: types.nonNull(types.ID) }),
    filesize: types.field({ type: types.nonNull(types.Int) }),
    height: types.field({ type: types.nonNull(types.Int) }),
    width: types.field({ type: types.nonNull(types.Int) }),
    extension: types.field({ type: types.nonNull(ImageExtensionEnum) }),
    ref: types.field({
      type: types.nonNull(types.String),
      resolve(data) {
        return "";
      },
    }),
    src: types.field({
      type: types.nonNull(types.String),
      args: {},
      resolve(data, {}, context) {
        return "";
      },
    }),
  });

  const ImageFieldOutput = types.interface()({
    name: "ImageFieldOutput",
    fields: imageOutputFields,
  });

  const LocalImageFieldOutput = types.object<ImageData>()({
    name: "LocalImageFieldOutput",
    interfaces: [ImageFieldOutput],
    fields: {
      id: types.field({ type: types.nonNull(types.ID) }),
      filesize: types.field({ type: types.nonNull(types.Int) }),
      height: types.field({ type: types.nonNull(types.Int) }),
      width: types.field({ type: types.nonNull(types.Int) }),
      extension: types.field({ type: types.nonNull(ImageExtensionEnum) }),
      ref: types.field({
        type: types.nonNull(types.String),
        resolve(data) {
          return "";
        },
      }),
      src: types.field({
        type: types.nonNull(types.String),
        resolve(data, args, context) {
          return "";
        },
      }),
    },
  });
}

types.fields<{ thing: Promise<string>[] }>()({
  thing: types.field({
    type: types.list(types.String),
  }),
});

types.fields()({
  thing: types.field({
    type: types.list(types.String),
    resolve() {
      return [Promise.resolve("")];
    },
  }),
});

types.fields<{ thing: Promise<string> }>()({
  thing: types.field({
    type: types.String,
  }),
});

// note it's important that the type annotation is on another variable declaration
// since the type annotation can influence the return type and we don't want that here

{
  const arg = types.arg({
    type: types.String,
  });

  const _assert: types.Arg<typeof types.String, undefined> = arg;
}

{
  const arg = types.arg({
    type: types.String,
    defaultValue: undefined,
  });

  const _assert: types.Arg<typeof types.String, undefined> = arg;
}

{
  const arg = types.arg({
    type: types.String,
    defaultValue: "",
  });

  const _assert: types.Arg<typeof types.String, string> = arg;
}

{
  const arg = types.arg({
    type: types.String,
    defaultValue: null,
  });

  const _assert: types.Arg<typeof types.String, null> = arg;
}

{
  const arg = types.arg({
    type: types.String,
    defaultValue: null,
  });

  const _assert: types.Arg<typeof types.String, null> = arg;
}

{
  const arg = types.arg({
    type: types.String,
    defaultValue: Math.random() > 0.5 ? "" : null,
  });

  const _assert: types.Arg<typeof types.String, string | null> = arg;
  // @ts-expect-error
  const _assert1: types.Arg<typeof types.String, null> = arg;
  // @ts-expect-error
  const _assert2: types.Arg<typeof types.String, string> = arg;
}

{
  const arg = types.arg({
    type: types.String,
    ...(Math.random() > 0.5
      ? {
          defaultValue: "",
        }
      : {}),
  });

  const _assert: types.Arg<typeof types.String, string | undefined> = arg;
}
