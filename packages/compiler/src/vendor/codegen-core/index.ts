// https://github.com/dotansimha/graphql-code-generator/blob/master/packages/graphql-codegen-core/src/codegen.ts

import type { Types, CodegenPlugin } from "@graphql-codegen/plugin-helpers";
import { GraphQLSchema } from "graphql/type";
import { executePlugin } from "./execute-plugin";

function isComplexPluginOutput(obj: Types.PluginOutput) {
  return typeof obj === "object" && obj.hasOwnProperty("content");
}

interface GenerateOptions {
  filename: string;
  plugins: Types.ConfiguredPlugin[];
  schemaAst: GraphQLSchema;
  documents: Types.DocumentFile[];
  config: {
    [key: string]: any;
  };
  pluginMap: {
    [name: string]: CodegenPlugin;
  };
  skipDocumentsValidation?: boolean;
}

export function codegen(options: GenerateOptions): string {
  const prepend: Set<string> = new Set<string>();
  const append: Set<string> = new Set<string>();

  const output = options.plugins.map((plugin) => {
    const name = Object.keys(plugin)[0];
    const pluginPackage = options.pluginMap[name];
    const pluginConfig = plugin[name] || {};

    const execConfig =
      typeof pluginConfig !== "object"
        ? pluginConfig
        : {
            ...options.config,
            ...pluginConfig,
          };

    const result = executePlugin(
      {
        name,
        config: execConfig,
        parentConfig: options.config,
        schemaAst: options.schemaAst,
        documents: options.documents,
        outputFilename: options.filename,
        allPlugins: options.plugins,
        skipDocumentsValidation: options.skipDocumentsValidation,
      },
      pluginPackage
    );

    if (typeof result === "string") {
      return result || "";
    } else if (isComplexPluginOutput(result)) {
      if (result.append && result.append.length > 0) {
        for (const item of result.append) {
          append.add(item);
        }
      }

      if (result.prepend && result.prepend.length > 0) {
        for (const item of result.prepend) {
          prepend.add(item);
        }
      }
      return result.content || "";
    }

    return "";
  });

  return [
    ...sortPrependValues(Array.from(prepend.values())),
    ...output,
    ...Array.from(append.values()),
  ].join("\n");
}

function resolveCompareValue(a: string) {
  if (
    a.startsWith("/*") ||
    a.startsWith("//") ||
    a.startsWith(" *") ||
    a.startsWith(" */") ||
    a.startsWith("*/")
  ) {
    return 0;
  } else if (a.startsWith("package")) {
    return 1;
  } else if (a.startsWith("import")) {
    return 2;
  } else {
    return 3;
  }
}

export function sortPrependValues(values: string[]): string[] {
  return values.sort((a: string, b: string) => {
    const aV = resolveCompareValue(a);
    const bV = resolveCompareValue(b);

    if (aV < bV) {
      return -1;
    }
    if (aV > bV) {
      return 1;
    }

    return 0;
  });
}
