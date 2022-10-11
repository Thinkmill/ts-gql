// https://github.com/dotansimha/graphql-code-generator/blob/master/packages/graphql-codegen-core/src/execute-plugin.ts

import type { Types, CodegenPlugin } from "@graphql-codegen/plugin-helpers";
import type { GraphQLSchema } from "graphql";

export interface ExecutePluginOptions {
  name: string;
  config: Types.PluginConfig;
  parentConfig: Types.PluginConfig;
  schemaAst: GraphQLSchema;
  documents: Types.DocumentFile[];
  outputFilename: string;
  allPlugins: Types.ConfiguredPlugin[];
  skipDocumentsValidation?: boolean;
}

export function executePlugin(
  options: ExecutePluginOptions,
  plugin: CodegenPlugin
): Types.PluginOutput {
  const outputSchema: GraphQLSchema = options.schemaAst;
  const documents = options.documents || [];

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
  return result as any as Types.PluginOutput;
}
