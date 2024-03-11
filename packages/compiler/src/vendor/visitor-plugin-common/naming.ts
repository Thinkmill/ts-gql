import type { ASTNode } from "graphql";
import { ConvertFn } from "./types";

function getName(node: ASTNode | string | undefined): string | undefined {
  if (node == null) {
    return undefined;
  }

  if (typeof node === "string") {
    return node;
  }

  switch (node.kind) {
    case "OperationDefinition":
    case "Variable":
    case "Argument":
    case "FragmentSpread":
    case "FragmentDefinition":
    case "ObjectField":
    case "Directive":
    case "NamedType":
    case "ScalarTypeDefinition":
    case "ObjectTypeDefinition":
    case "FieldDefinition":
    case "InputValueDefinition":
    case "InterfaceTypeDefinition":
    case "UnionTypeDefinition":
    case "EnumTypeDefinition":
    case "EnumValueDefinition":
    case "InputObjectTypeDefinition":
    case "DirectiveDefinition": {
      return getName(node.name);
    }
    case "Name": {
      return node.value;
    }
    case "Field": {
      return getName(node.alias || node.name);
    }
    case "VariableDefinition": {
      return getName(node.variable);
    }
  }

  return undefined;
}

export const convertName: ConvertFn = (node, opts) => {
  const prefix = opts?.prefix;
  const suffix = opts?.suffix;

  const str = [prefix || "", getName(node), suffix || ""].join("");

  return str;
};
