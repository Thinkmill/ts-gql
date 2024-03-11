export function weakMemoize<Arg extends object, Return>(
  fn: (arg: Arg) => Return
): (arg: Arg) => Return {
  const cache = new WeakMap<Arg, Return>();
  return (arg: Arg) => {
    if (cache.has(arg)) return cache.get(arg)!;
    const result = fn(arg);
    cache.set(arg, result);
    return result;
  };
}
