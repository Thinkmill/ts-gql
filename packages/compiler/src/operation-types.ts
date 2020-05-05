import fs from "fs-extra";
import {
  GraphQLSchema,
  DocumentNode,
  parse,
  printSchema,
  OperationDefinitionNode,
  FragmentDefinitionNode,
} from "graphql";
import { codegen } from "./codegen-core";
import * as typescriptOperationsPlugin from "@graphql-codegen/typescript-operations";
import { hashString, parseTsGqlMeta } from "./utils";
import { FsOperation } from "./fs-operations";

async function generateOperationTypes(
  schema: GraphQLSchema,
  operation: DocumentNode,
  operationNode: OperationDefinitionNode | FragmentDefinitionNode,
  filename: string,
  operationHash: string,
  operationName: string,
  isValid: boolean
): Promise<FsOperation> {
  if (!isValid) {
    return {
      type: "output",
      filename,
      content: `/*\nts-gql-meta-begin\n${JSON.stringify(
        {
          hash: operationHash,
        },
        null,
        2
      )}\nts-gql-meta-end\n*/\n\n
  
  export type type = never
  
  throw new Error("There is an error in the types of ${operationName}")
  `,
    };
  }

  let result = codegen({
    documents: [{ document: operation }],
    schema: parse(printSchema(schema)),
    schemaAst: schema,
    config: {},
    filename: "",

    plugins: [
      {
        "typescript-operations": {
          namespacedImportName: "SchemaTypes",
          immutableTypes: true,
          noExport: true,
          nonOptionalTypename: true,
          namingConvention: "keep",
        },
      },
    ],
    pluginMap: { "typescript-operations": typescriptOperationsPlugin },
  });

  const operationType =
    operationNode.kind === "OperationDefinition"
      ? operationNode.operation
      : "fragment";

  let upperCaseOperationName =
    operationType.charAt(0).toUpperCase() + operationType.slice(1);
  return {
    type: "output",
    filename,
    content: `/*\nts-gql-meta-begin\n${JSON.stringify(
      {
        hash: operationHash,
      },
      null,
      2
    )}\nts-gql-meta-end\n*/\n\nimport * as SchemaTypes from "./@schema";\nimport { TypedDocumentNode } from "@ts-gql/tag";\n\n${result}

export type type = TypedDocumentNode<{
  type: ${JSON.stringify(operationType)};
  result: ${operationName + upperCaseOperationName};${
      operationType === "fragment"
        ? ""
        : `\n  variables: ${
            operationName + upperCaseOperationName + "Variables"
          };`
    }
}>

export const document = ${JSON.stringify(
      operation,
      (key, value) => (key === "loc" ? undefined : value),
      2
    )}
`,
  };
}

export async function cachedGenerateOperationTypes(
  schema: GraphQLSchema,
  operation: DocumentNode,
  operationNode: OperationDefinitionNode | FragmentDefinitionNode,
  filename: string,
  schemaHash: string,
  operationName: string,
  isValid: boolean
) {
  let operationHash = hashString(schemaHash + JSON.stringify(operation) + "v3");
  let types: string;
  try {
    types = await fs.readFile(filename, "utf8");
  } catch (err) {
    if (err.code === "ENOENT") {
      return generateOperationTypes(
        schema,
        operation,
        operationNode,
        filename,
        operationHash,
        operationName,
        isValid
      );
    }
    throw err;
  }
  let meta = parseTsGqlMeta(types);
  if (meta.hash !== operationHash) {
    return generateOperationTypes(
      schema,
      operation,
      operationNode,
      filename,
      operationHash,
      operationName,
      isValid
    );
  }
}
