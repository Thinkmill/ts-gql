import { inputObject, arg, InferValueFromInputType } from "./input";
import * as scalars from "./scalars";

const x = inputObject({
  name: "something",
  fields: {
    thing: arg({
      type: scalars.String,
      // defaultValue: "something",
    }),
  },
});

type x = InferValueFromInputType<typeof x>;
