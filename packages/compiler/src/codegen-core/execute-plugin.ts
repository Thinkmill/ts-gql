// https://github.com/dotansimha/graphql-code-generator/blob/master/packages/graphql-codegen-core/src/execute-plugin.ts

import {
  DetailedError,
  Types,
  CodegenPlugin,
} from "@graphql-codegen/plugin-helpers";
import { DocumentNode, GraphQLSchema, buildASTSchema } from "graphql";

export interface ExecutePluginOptions {
  name: string;
  config: Types.PluginConfig;
  parentConfig: Types.PluginConfig;
  schema: DocumentNode;
  schemaAst?: GraphQLSchema;
  documents: Types.DocumentFile[];
  outputFilename: string;
  allPlugins: Types.ConfiguredPlugin[];
  skipDocumentsValidation?: boolean;
}

export function executePlugin(
  options: ExecutePluginOptions,
  plugin: CodegenPlugin
): Types.PluginOutput {
  if (!plugin || !plugin.plugin || typeof plugin.plugin !== "function") {
    throw new DetailedError(
      `Invalid Custom Plugin "${options.name}"`,
      `
        Plugin ${options.name} does not export a valid JS object with "plugin" function.
  
        Make sure your custom plugin is written in the following form:
  
        module.exports = {
          plugin: (schema, documents, config) => {
            return 'my-custom-plugin-content';
          },
        };
        `
    );
  }

  const outputSchema: GraphQLSchema =
    options.schemaAst || buildASTSchema(options.schema, options.config as any);
  const documents = options.documents || [];

  if (plugin.validate && typeof plugin.validate === "function") {
    try {
      let result = plugin.validate(
        outputSchema,
        documents,
        options.config,
        options.outputFilename,
        options.allPlugins
      );
      if (result && typeof result.then === "function") {
        throw new Error("plugins must be synchronous");
      }
    } catch (e) {
      throw new DetailedError(
        `Plugin "${options.name}" validation failed:`,
        `
            ${e.message}
          `
      );
    }
  }

  let result = plugin.plugin(
    outputSchema,
    documents,
    typeof options.config === "object" ? { ...options.config } : options.config,
    {
      outputFile: options.outputFilename,
      allPlugins: options.allPlugins,
    }
  );
  // @ts-ignore
  if (typeof result.then === "function") {
    throw new Error("plugins must be synchronous");
  }
  return (result as any) as Types.PluginOutput;
}
