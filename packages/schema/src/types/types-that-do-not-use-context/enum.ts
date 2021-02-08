import { GraphQLEnumType } from "graphql/type/definition";

export type EnumValue<Value> = {
  description?: string;
  deprecationReason?: string;
  value: Value;
};

export type EnumType<Values extends Record<string, EnumValue<any>>> = {
  kind: "enum";
  values: Values;
  graphQLType: GraphQLEnumType;
  __context: unknown;
};

export function enumValues<Values extends readonly string[]>(
  values: [...Values]
): Record<Values[number], EnumValue<Values[number]>> {
  return Object.fromEntries(values.map((value) => [value, { value }]));
}

function enumType<Values extends Record<string, EnumValue<any>>>(config: {
  name: string;
  description?: string;
  values: Values;
}): EnumType<Values> {
  const graphQLType = new GraphQLEnumType({
    name: config.name,
    description: config.description,
    values: config.values,
  });
  return {
    kind: "enum",
    values: config.values,
    graphQLType,
    __context: undefined as any,
  };
}

export { enumType as enum };
