// Preconstruct doesn't currently correctly handle .js with .d.ts files directly at an entrypoint
// though it does correctly handle them as dependencies of an entrypoint so we need to have a .ts
// as the actual entrypoint and then Preconstruct will be okay with it
export {
  field,
  fields,
  interface,
  interfaceField,
  object,
  union,
} from "./types-with-context";
