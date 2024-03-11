import {
  FragmentDefinitionNode,
  GraphQLSchema,
  OperationDefinitionNode,
  OperationTypeNode,
  VariableDefinitionNode,
} from "graphql";
import { BaseVisitor, ParsedConfig, RawConfig } from "./base-visitor";
import { DEFAULT_SCALARS } from "./scalars";
import { SelectionSetToObject } from "./selection-set-to-object";
import {
  DeclarationKind,
  DeclarationKindConfig,
  DirectiveArgumentAndInputFieldMappings,
  EnumValuesMap,
  NormalizedScalarsMap,
  ParsedDirectiveArgumentAndInputFieldMappings,
  ParsedEnumValuesMap,
} from "./types";
import {
  buildScalarsFromConfig,
  DeclarationBlock,
  DeclarationBlockConfig,
  getConfigValue,
} from "./utils";
import { OperationVariablesToObject } from "./variables-to-object";
import { autoBind } from "../auto-bind";

function getRootType(operation: OperationTypeNode, schema: GraphQLSchema) {
  switch (operation) {
    case "query":
      return schema.getQueryType();
    case "mutation":
      return schema.getMutationType();
    case "subscription":
      return schema.getSubscriptionType();
  }
  throw new Error(`Unknown operation type: ${operation}`);
}

interface ParsedTypesConfig extends ParsedConfig {
  enumValues: ParsedEnumValuesMap;
  declarationKind: DeclarationKindConfig;
  addUnderscoreToArgsType: boolean;
  onlyEnums: boolean;
  onlyOperationTypes: boolean;
  enumPrefix: boolean;
  enumSuffix: boolean;
  fieldWrapperValue: string;
  wrapFieldDefinitions: boolean;
  entireFieldWrapperValue: string;
  wrapEntireDefinitions: boolean;
  ignoreEnumValuesFromSchema: boolean;
  directiveArgumentAndInputFieldMappings: ParsedDirectiveArgumentAndInputFieldMappings;
}

export interface ParsedDocumentsConfig extends ParsedTypesConfig {
  addTypename: boolean;
  preResolveTypes: boolean;
  extractAllFieldsToTypes: boolean;
  globalNamespace: boolean;
  operationResultSuffix: string;
  dedupeOperationSuffix: boolean;
  omitOperationSuffix: boolean;
  namespacedImportName: string | null;
  exportFragmentSpreadSubTypes: boolean;
  skipTypeNameForRoot: boolean;
  mergeFragmentTypes: boolean;
}

interface RawTypesConfig extends RawConfig {
  /**
   * @description Adds `_` to generated `Args` types in order to avoid duplicate identifiers.
   *
   * @exampleMarkdown
   * ## With Custom Values
   *
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          addUnderscoreToArgsType: true
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  addUnderscoreToArgsType?: boolean;
  /**
   * @description Overrides the default value of enum values declared in your GraphQL schema.
   * You can also map the entire enum to an external type by providing a string that of `module#type`.
   *
   * @exampleMarkdown
   * ## With Custom Values
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          enumValues: {
   *            MyEnum: {
   *              A: 'foo'
   *            }
   *          }
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   *
   * ## With External Enum
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          enumValues: {
   *            MyEnum: './my-file#MyCustomEnum',
   *          }
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   *
   * ## Import All Enums from a file
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          enumValues: {
   *            MyEnum: './my-file',
   *          }
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  enumValues?: EnumValuesMap;
  /**
   * @description Overrides the default output for various GraphQL elements.
   *
   * @exampleMarkdown
   * ## Override all declarations
   *
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          declarationKind: 'interface'
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   *
   * ## Override only specific declarations
   *
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          declarationKind: {
   *            type: 'interface',
   *            input: 'interface'
   *          }
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  declarationKind?: DeclarationKind | DeclarationKindConfig;
  /**
   * @default true
   * @description Allow you to disable prefixing for generated enums, works in combination with `typesPrefix`.
   *
   * @exampleMarkdown
   * ## Disable enum prefixes
   *
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          typesPrefix: 'I',
   *          enumPrefix: false
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  enumPrefix?: boolean;
  /**
   * @default true
   * @description Allow you to disable suffixing for generated enums, works in combination with `typesSuffix`.
   *
   * @exampleMarkdown
   * ## Disable enum suffixes
   *
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          typesSuffix: 'I',
   *          enumSuffix: false
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  enumSuffix?: boolean;
  /**
   * @description Allow you to add wrapper for field type, use T as the generic value. Make sure to set `wrapFieldDefinitions` to `true` in order to make this flag work.
   * @default T
   *
   * @exampleMarkdown
   * ## Allow Promise
   *
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          wrapFieldDefinitions: true,
   *          fieldWrapperValue: 'T | Promise<T>',
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  fieldWrapperValue?: string;
  /**
   * @description Set to `true` in order to wrap field definitions with `FieldWrapper`.
   * This is useful to allow return types such as Promises and functions.
   * @default false
   *
   * @exampleMarkdown
   * ## Enable wrapping fields
   *
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          wrapFieldDefinitions: true,
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  wrapFieldDefinitions?: boolean;
  /**
   * @description This will cause the generator to emit types for enums only
   * @default false
   *
   * @exampleMarkdown
   * ## Override all definition types
   *
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          onlyEnums: true,
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  onlyEnums?: boolean;
  /**
   * @description This will cause the generator to emit types for operations only (basically only enums and scalars)
   * @default false
   *
   * @exampleMarkdown
   * ## Override all definition types
   *
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          onlyOperationTypes: true,
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  onlyOperationTypes?: boolean;
  /**
   * @description This will cause the generator to ignore enum values defined in GraphQLSchema
   * @default false
   *
   * @exampleMarkdown
   * ## Ignore enum values from schema
   *
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          ignoreEnumValuesFromSchema: true,
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  ignoreEnumValuesFromSchema?: boolean;
  /**
   * @name wrapEntireFieldDefinitions
   * @type boolean
   * @description Set to `true` in order to wrap field definitions with `EntireFieldWrapper`.
   * This is useful to allow return types such as Promises and functions for fields.
   * Differs from `wrapFieldDefinitions` in that this wraps the entire field definition if i.e. the field is an Array, while
   * `wrapFieldDefinitions` will wrap every single value inside the array.
   * @default true
   *
   * @example Enable wrapping entire fields
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          wrapEntireFieldDefinitions: false,
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  wrapEntireFieldDefinitions?: boolean;
  /**
   * @name entireFieldWrapperValue
   * @type string
   * @description Allow to override the type value of `EntireFieldWrapper`. This wrapper applies outside of Array and Maybe
   * unlike `fieldWrapperValue`, that will wrap the inner type.
   * @default T | Promise<T> | (() => T | Promise<T>)
   *
   * @example Only allow values
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          entireFieldWrapperValue: 'T',
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  entireFieldWrapperValue?: string;
  /**
   * @description Replaces a GraphQL scalar with a custom type based on the applied directive on an argument or input field.
   *
   * You can use both `module#type` and `module#namespace#type` syntax.
   * Will NOT work with introspected schemas since directives are not exported.
   * Only works with directives on ARGUMENT_DEFINITION or INPUT_FIELD_DEFINITION.
   *
   * **WARNING:** Using this option does only change the type definitions.
   *
   * For actually ensuring that a type is correct at runtime you will have to use schema transforms (e.g. with [@graphql-tools/utils mapSchema](https://graphql-tools.com/docs/schema-directives)) that apply those rules!
   * Otherwise, you might end up with a runtime type mismatch which could cause unnoticed bugs or runtime errors.
   *
   * Please use this configuration option with care!
   *
   * @exampleMarkdown
   * ## Custom Context Type\
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          directiveArgumentAndInputFieldMappings: {
   *            AsNumber: 'number',
   *            AsComplex: './my-models#Complex',
   *          }
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  directiveArgumentAndInputFieldMappings?: DirectiveArgumentAndInputFieldMappings;
  /**
   * @description Adds a suffix to the imported names to prevent name clashes.
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          directiveArgumentAndInputFieldMappings: 'Model'
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  directiveArgumentAndInputFieldMappingTypeSuffix?: string;
}

export interface RawDocumentsConfig extends RawTypesConfig {
  /**
   * @default true
   * @description Uses primitive types where possible.
   * Set to `false` in order to use `Pick` and take use the types generated by `typescript` plugin.
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          preResolveTypes: false
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  preResolveTypes?: boolean;
  /**
   * @default false
   * @description Avoid adding `__typename` for root types. This is ignored when a selection explicitly specifies `__typename`.
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          skipTypeNameForRoot: true
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  skipTypeNameForRoot?: boolean;
  /**
   * @default false
   * @description Puts all generated code under `global` namespace. Useful for Stencil integration.
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          globalNamespace: true
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  globalNamespace?: boolean;
  /**
   * @default ""
   * @description Adds a suffix to generated operation result type names
   */
  operationResultSuffix?: string;
  /**
   * @default false
   * @description Set this configuration to `true` if you wish to make sure to remove duplicate operation name suffix.
   */
  dedupeOperationSuffix?: boolean;
  /**
   * @default false
   * @description Set this configuration to `true` if you wish to disable auto add suffix of operation name, like `Query`, `Mutation`, `Subscription`, `Fragment`.
   */
  omitOperationSuffix?: boolean;
  /**
   * @default false
   * @description If set to true, it will export the sub-types created in order to make it easier to access fields declared under fragment spread.
   */
  exportFragmentSpreadSubTypes?: boolean;
  /**
   * @default false
   * @description If set to true, merge equal fragment interfaces.
   */
  mergeFragmentTypes?: boolean;

  // The following are internal, and used by presets
  /**
   * @ignore
   */
  namespacedImportName?: string;
}

export class BaseDocumentsVisitor<
  TRawConfig extends RawDocumentsConfig = RawDocumentsConfig,
  TPluginConfig extends ParsedDocumentsConfig = ParsedDocumentsConfig
> extends BaseVisitor<TRawConfig, TPluginConfig> {
  protected _unnamedCounter = 1;
  protected _variablesTransfomer: OperationVariablesToObject;
  protected _selectionSetToObject!: SelectionSetToObject;
  protected _globalDeclarations: Set<string> = new Set<string>();

  constructor(
    rawConfig: TRawConfig,
    additionalConfig: TPluginConfig,
    protected _schema: GraphQLSchema,
    defaultScalars: NormalizedScalarsMap = DEFAULT_SCALARS
  ) {
    super(rawConfig, {
      exportFragmentSpreadSubTypes: getConfigValue(
        rawConfig.exportFragmentSpreadSubTypes,
        false
      ),
      enumPrefix: getConfigValue(rawConfig.enumPrefix, true),
      enumSuffix: getConfigValue(rawConfig.enumSuffix, true),
      preResolveTypes: getConfigValue(rawConfig.preResolveTypes, true),
      dedupeOperationSuffix: getConfigValue(
        rawConfig.dedupeOperationSuffix,
        false
      ),
      omitOperationSuffix: getConfigValue(rawConfig.omitOperationSuffix, false),
      skipTypeNameForRoot: getConfigValue(rawConfig.skipTypeNameForRoot, false),
      namespacedImportName: getConfigValue(
        rawConfig.namespacedImportName,
        null
      ),
      addTypename: !rawConfig.skipTypename,
      globalNamespace: !!rawConfig.globalNamespace,
      operationResultSuffix: getConfigValue(
        rawConfig.operationResultSuffix,
        ""
      ),
      scalars: buildScalarsFromConfig(_schema, rawConfig, defaultScalars),
      ...((additionalConfig || {}) as any),
    });

    autoBind(this);
    this._variablesTransfomer = new OperationVariablesToObject(
      this.scalars,
      this.convertName,
      this.config.namespacedImportName
    );
  }

  public getGlobalDeclarations(noExport = false): string[] {
    return Array.from(this._globalDeclarations).map((t) =>
      noExport ? t : `export ${t}`
    );
  }

  setSelectionSetHandler(handler: SelectionSetToObject): void {
    this._selectionSetToObject = handler;
  }

  setDeclarationBlockConfig(config: DeclarationBlockConfig): void {
    this._declarationBlockConfig = config;
  }

  setVariablesTransformer(
    variablesTransfomer: OperationVariablesToObject
  ): void {
    this._variablesTransfomer = variablesTransfomer;
  }

  public get schema(): GraphQLSchema {
    return this._schema;
  }

  public get addTypename(): boolean {
    return this._parsedConfig.addTypename;
  }

  private handleAnonymousOperation(node: OperationDefinitionNode): string {
    const name = node.name?.value;

    if (name) {
      return this.convertName(name, {
        useTypesPrefix: false,
        useTypesSuffix: false,
      });
    }

    return this.convertName(String(this._unnamedCounter++), {
      prefix: "Unnamed_",
      suffix: "_",
      useTypesPrefix: false,
      useTypesSuffix: false,
    });
  }

  FragmentDefinition(node: FragmentDefinitionNode): string {
    const fragmentRootType = this._schema.getType(
      node.typeCondition.name.value
    )!;
    const selectionSet = this._selectionSetToObject.createNext(
      fragmentRootType,
      node.selectionSet
    );
    const fragmentSuffix = this.getFragmentSuffix(node);
    return selectionSet.transformFragmentSelectionSetToTypes(
      node.name.value,
      fragmentSuffix,
      this._declarationBlockConfig
    );
  }

  protected applyVariablesWrapper(
    variablesBlock: string,
    _operationType?: string
  ): string {
    return variablesBlock;
  }

  OperationDefinition(node: OperationDefinitionNode): string {
    const name = this.handleAnonymousOperation(node);
    const operationRootType = getRootType(node.operation, this._schema);

    if (!operationRootType) {
      throw new Error(
        `Unable to find root schema type for operation type "${node.operation}"!`
      );
    }

    const selectionSet = this._selectionSetToObject.createNext(
      operationRootType,
      node.selectionSet
    );
    const visitedOperationVariables =
      this._variablesTransfomer.transform<VariableDefinitionNode>(
        node.variableDefinitions || []
      );
    const operationType =
      node.operation[0].toUpperCase() + node.operation.slice(1);
    const operationTypeSuffix = this.getOperationSuffix(name, operationType);
    const selectionSetObjects = selectionSet.transformSelectionSet(
      this.convertName(name, {
        suffix: operationTypeSuffix,
      })
    );

    const operationResult = new DeclarationBlock(this._declarationBlockConfig)
      .export()
      .asKind("type")
      .withName(
        this.convertName(name, {
          suffix:
            operationTypeSuffix + this._parsedConfig.operationResultSuffix,
        })
      )
      .withContent(selectionSetObjects.mergedTypeString).string;

    const operationVariables = new DeclarationBlock({
      ...this._declarationBlockConfig,
      blockTransformer: (t) => this.applyVariablesWrapper(t, operationType),
    })
      .export()
      .asKind("type")
      .withName(
        this.convertName(name, {
          suffix: operationTypeSuffix + "Variables",
        })
      )
      .withBlock(visitedOperationVariables!).string;

    const dependentTypesContent = this._parsedConfig.extractAllFieldsToTypes
      ? selectionSetObjects.dependentTypes.map(
          (i) =>
            new DeclarationBlock(this._declarationBlockConfig)
              .export()
              .asKind("type")
              .withName(i.name)
              .withContent(i.content).string
        )
      : [];

    return [
      ...(dependentTypesContent.length > 0
        ? [dependentTypesContent.join("\n")]
        : []),
      operationVariables,
      operationResult,
    ]
      .filter((r) => r)
      .join("\n\n");
  }
}
