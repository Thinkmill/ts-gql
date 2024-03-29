import {
  BaseSelectionSetProcessor,
  LinkField,
  PrimitiveAliasedFields,
  PrimitiveField,
  ProcessResult,
  SelectionSetProcessorConfig,
} from "../visitor-plugin-common";
import {
  GraphQLInterfaceType,
  GraphQLObjectType,
} from "graphql/type/definition";

export class TypeScriptSelectionSetProcessor extends BaseSelectionSetProcessor<SelectionSetProcessorConfig> {
  transformPrimitiveFields(
    schemaType: GraphQLObjectType | GraphQLInterfaceType,
    fields: PrimitiveField[],
    unsetTypes?: boolean
  ): ProcessResult {
    if (fields.length === 0) {
      return [];
    }

    const parentName =
      (this.config.namespacedImportName
        ? `${this.config.namespacedImportName}.`
        : "") +
      this.config.convertName(schemaType.name, {
        useTypesPrefix: true,
      });

    if (unsetTypes) {
      return [
        `MakeEmpty<${parentName}, ${fields
          .map((field) => `'${field.fieldName}'`)
          .join(" | ")}>`,
      ];
    }

    let hasConditionals = false;
    const conditilnalsList: string[] = [];
    let resString = `Pick<${parentName}, ${fields
      .map((field) => {
        if (field.isConditional) {
          hasConditionals = true;
          conditilnalsList.push(field.fieldName);
        }
        return `'${field.fieldName}'`;
      })
      .join(" | ")}>`;

    if (hasConditionals) {
      const avoidOptional =
        // TODO: check type and exec only if relevant
        this.config.avoidOptionals === true ||
        (typeof this.config.avoidOptionals === "object" &&
          (this.config.avoidOptionals.field ||
            this.config.avoidOptionals.inputValue ||
            this.config.avoidOptionals.object));

      const transform = avoidOptional ? "MakeMaybe" : "MakeOptional";
      resString = `${
        this.config.namespacedImportName
          ? `${this.config.namespacedImportName}.`
          : ""
      }${transform}<${resString}, ${conditilnalsList
        .map((field) => `'${field}'`)
        .join(" | ")}>`;
    }
    return [resString];
  }

  transformTypenameField(type: string, name: string): ProcessResult {
    return [`{ ${name}: ${type} }`];
  }

  transformAliasesPrimitiveFields(
    schemaType: GraphQLObjectType | GraphQLInterfaceType,
    fields: PrimitiveAliasedFields[]
  ): ProcessResult {
    if (fields.length === 0) {
      return [];
    }

    const parentName =
      (this.config.namespacedImportName
        ? `${this.config.namespacedImportName}.`
        : "") +
      this.config.convertName(schemaType.name, {
        useTypesPrefix: true,
      });

    return [
      `{ ${fields
        .map((aliasedField) => {
          const value =
            aliasedField.fieldName === "__typename"
              ? `'${schemaType.name}'`
              : `${parentName}['${aliasedField.fieldName}']`;

          return `${aliasedField.alias}: ${value}`;
        })
        .join(", ")} }`,
    ];
  }

  transformLinkFields(fields: LinkField[]): ProcessResult {
    if (fields.length === 0) {
      return [];
    }

    return [
      `{ ${fields
        .map((field) => `${field.alias || field.name}: ${field.selectionSet}`)
        .join(", ")} }`,
    ];
  }
}
