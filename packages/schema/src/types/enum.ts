import { GraphQLEnumType } from "graphql";

export type EnumValue<Value> = {
  description?: string;
  deprecationReason?: string;
  value: Value;
};

export type Enum<Values extends Record<string, EnumValue<any>>> = {
  kind: "enum";
  values: Values;
  graphQLType: GraphQLEnumType;
};

export function enumValues<Values extends readonly string[]>(
  values: [...Values]
): Record<Values[number], EnumValue<Values[number]>> {
  return Object.fromEntries(values.map((value) => [value, { value }]));
}

export function enumType<
  Values extends Record<string, EnumValue<any>>
>(config: {
  name: string;
  description?: string;
  values: Values;
}): Enum<Values> {
  const graphQLType = new GraphQLEnumType({
    name: config.name,
    description: config.description,
    values: config.values,
  });
  return {
    kind: "enum",
    values: config.values,
    graphQLType,
  };
}
