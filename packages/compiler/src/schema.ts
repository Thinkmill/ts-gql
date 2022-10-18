import {
  GraphQLEnumType,
  GraphQLInputField,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNamedType,
  GraphQLNonNull,
  GraphQLNullableType,
  GraphQLScalarType,
  GraphQLType,
} from "graphql/type/definition";
import { specifiedScalarTypes } from "graphql/type/scalars";
import { introspectionTypes } from "graphql/type/introspection";

import { GraphQLSchema } from "graphql/type/schema";

export type PrinterOptions = {
  readonly: boolean;
};

const introspectionTypeNames = new Set(
  introspectionTypes.map((type) => type.name)
);

const builtinScalars = {
  ID: "string",
  String: "string",
  Boolean: "boolean",
  Int: "number",
  Float: "number",
};

export type SchemaPrinterOptions = {
  schema: GraphQLSchema;
  readonly: boolean;
  scalars: Record<string, string>;
};

const deprecatedComment = `/** @deprecated This should not be used outside of code generated by ts-gql */`;

// the helper types are from GraphQL Code Generator so that when it
// generates the operation types, it has them available
const header = `${deprecatedComment}
export type Maybe<T> = T | null;
${deprecatedComment}
export type InputMaybe<T> = Maybe<T>;
${deprecatedComment}
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
${deprecatedComment}
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
${deprecatedComment}
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };

export type Scalars = {
`;

export function printSchemaTypes(options: SchemaPrinterOptions) {
  const { schema } = options;
  let output = "";
  const allScalars: Record<string, string> = {
    ...builtinScalars,
    ...options.scalars,
  };
  const typeMap = schema.getTypeMap();
  const allTypes: Set<GraphQLNamedType> = new Set(specifiedScalarTypes);
  const types = Object.values(typeMap);
  for (const type of types) {
    allTypes.add(type);
  }
  let scalarsOutput = "";
  for (const type of allTypes) {
    if (introspectionTypeNames.has(type.name)) continue;
    if (type instanceof GraphQLEnumType) {
      output += "\n\n" + printEnumType(type);
    }
    if (type instanceof GraphQLInputObjectType) {
      output += "\n\n" + printInputObjectType(type, options.readonly);
    }
    if (type instanceof GraphQLScalarType) {
      scalarsOutput += `  ${type.name}: ${allScalars[type.name] ?? "any"};\n`;
      continue;
    }
  }
  return (
    header +
    scalarsOutput +
    "};" +
    output +
    `\n\ntype TSGQLMaybeArray<T> = ${
      options.readonly ? "ReadonlyArray" : "Array"
    }<T> | T\n\nexport {};`
  );
}

function printInputObjectType(
  type: GraphQLInputObjectType,
  isReadonly: boolean
) {
  return `export type ${type.name} = {\n${printInputFields(
    Object.values(type.getFields()),
    isReadonly
  )}\n};`;
}

function printInputFields(
  fields: readonly GraphQLInputField[],
  isReadonly: boolean
) {
  const readonlyPart = isReadonly ? "readonly " : "";
  return fields
    .map(
      (field) =>
        `  ${readonlyPart}${field.name}${
          field.type instanceof GraphQLNonNull &&
          field.defaultValue === undefined
            ? ""
            : "?"
        }: ${printTypeReference(field.type, isReadonly)};`
    )
    .join("\n");
}

function printEnumType(type: GraphQLEnumType) {
  return `type ${type.name} = ${type
    .getValues()
    .map((value) => `  | "${value.name}"`)
    .join("\n")};`;
}

function printTypeReferenceWithoutNullability(
  type: GraphQLNullableType,
  isReadonly: boolean
): string {
  if (type instanceof GraphQLList) {
    return `TSGQLMaybeArray<${printTypeReference(type.ofType, isReadonly)}>`;
  }
  if (type instanceof GraphQLScalarType) {
    return `Scalars['${type.name}']`;
  }
  return type.name;
}

function printTypeReference(type: GraphQLType, isReadonly: boolean): string {
  if (type instanceof GraphQLNonNull) {
    return printTypeReferenceWithoutNullability(type.ofType, isReadonly);
  }
  const inner = printTypeReferenceWithoutNullability(type, isReadonly);
  return `${inner} | null`;
}
