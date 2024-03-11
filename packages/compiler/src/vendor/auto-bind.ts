// https://github.com/sindresorhus/auto-bind/blob/5f9859a2c163a6567f0595b6268ef667c8248c6a/index.js
const getAllProperties = (object: object) => {
  const properties = new Set<[Record<string, any>, string | symbol]>();

  do {
    for (const key of Reflect.ownKeys(object)) {
      properties.add([object, key]);
    }
  } while (
    (object = Reflect.getPrototypeOf(object)!) &&
    object !== Object.prototype
  );

  return properties;
};

export function autoBind<SelfType extends Record<string, any>>(
  self: SelfType
): SelfType {
  for (const [object, key] of getAllProperties(self.constructor.prototype)) {
    if (key === "constructor") {
      continue;
    }

    const descriptor = Reflect.getOwnPropertyDescriptor(object, key);
    if (descriptor && typeof descriptor.value === "function") {
      (self as any)[key] = self[key as string].bind(self);
    }
  }

  return self;
}
