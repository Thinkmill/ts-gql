import chokidar from "chokidar";
import * as ts from "typescript";
import fs from "fs-extra";
import pFilter from "p-filter";
import path from "path";
import {
  DocumentNode,
  GraphQLSchema,
  OperationDefinitionNode,
  parse,
} from "graphql";
import { TsMorphWatcher } from "./ts-morph-watcher";
import { ensureSchemaTypesAreWritten } from "./schema-types";
import { getSchemaFromOptions } from "./get-schema";
import { ensureOperationTypesAreWritten } from "./operation-types";

const watcher = new TsMorphWatcher(chokidar.watch(["**/*.{ts,tsx}"]), {
  tsConfigFilePath: require.resolve("/tsconfig.json"),
});

(async () => {
  while (true) {
    let schema = getSchemaFromOptions({
      schemaFilename: path.join(process.cwd(), "schema.graphql"),
    });
    let generatedDirectory = path.join(
      path.join(process.cwd(), "__generated__", "ts-gql")
    );
    let { hash: schemaHash } = ensureSchemaTypesAreWritten(
      schema,
      generatedDirectory,
      {}
    );

    const project = await watcher.getNext();
    let typeChecker = project.getTypeChecker().compilerObject;
    let nodes: ts.TaggedTemplateExpression[] = [];
    for (let sourceFile of project.getSourceFiles()) {
      if (sourceFile.getSourceFile().getText().includes("gql")) {
        sourceFile.transform((traversal) => {
          const node = traversal.visitChildren();
          if (
            ts.isTaggedTemplateExpression(node) &&
            ts.isIdentifier(node.tag) &&
            node.tag.text === "gql"
          ) {
            nodes.push(node);
          }
          return node;
        });
      }
    }
    let nodesWithFragments = await pFilter(nodes, async (node) => {
      let template = node.template;
      if (ts.isNoSubstitutionTemplateLiteral(template)) {
        template.text;
        let { didWrite, name } = await checkDocument(
          {
            ast: parse(template.text),
            document: template.text,
          },
          { schema, hash: schemaHash },
          generatedDirectory,
          node.getSourceFile().fileName
        );

        if (didWrite) {
          let filename = path.join(generatedDirectory, `${name}.d.ts`);
          let sourceFile = project.getSourceFile(filename);
          if (sourceFile) {
            await sourceFile.refreshFromFileSystem();
          } else {
            project.addSourceFileAtPath(filename);
          }
        }
        return false;
      }
      return true;
    });

    nodesWithFragments.map(async (node) => {
      if (ts.isNoSubstitutionTemplateLiteral(node.template)) {
        throw new Error("unexpected no substitution template literal");
      }
      let operationContent = node.template.head.text;
      parse();
    });
  }
})();

function getFragmentDocumentFromExpressionNode(
  node: ts.Expression,
  typeChecker: ts.TypeChecker
): { type: "NOT_FOUND" } | { type: "FRAGMENT"; document: string } {
  let type = typeChecker.getTypeAtLocation(node);
  let internalTypesSymbol = type.getProperty("___type");
  if (!internalTypesSymbol) {
    return { type: "NOT_FOUND" };
  }
  let internalTypes = typeChecker.getTypeOfSymbolAtLocation(
    internalTypesSymbol,
    internalTypesSymbol.valueDeclaration
  );

  let internalTypesDocumentSymbol = internalTypes.getProperty("document");
  if (!internalTypesDocumentSymbol) {
    return { type: "NOT_FOUND" };
  }

  let internalTypesDocument = typeChecker.getTypeOfSymbolAtLocation(
    internalTypesDocumentSymbol,
    internalTypesDocumentSymbol.valueDeclaration
  );

  if (!internalTypesDocument.isStringLiteral()) {
    return { type: "NOT_FOUND" };
  }
  return { type: "FRAGMENT", document: internalTypesDocument.value };
}

async function checkDocument(
  document: { ast: DocumentNode; document: string },
  schema: { schema: GraphQLSchema; hash: string },
  generatedDirectory: string,
  currentFilename: string
) {
  const filteredDefinitions = document.ast.definitions.filter(
    (x): x is OperationDefinitionNode => x.kind === "OperationDefinition"
  );
  if (filteredDefinitions.length === 0) {
    return checkFragment(document, schema, generatedDirectory, currentFilename);
  }
  if (filteredDefinitions.length !== 1) {
    throw new ValidationError("There must only be a single operation");
  }
  const [operationNode] = filteredDefinitions;
  if (!operationNode.name) {
    throw new ValidationError("GraphQL operations must have names");
  }
  return {
    didWrite: await ensureOperationTypesAreWritten(
      schema.schema,
      document,
      operationNode,
      path.join(generatedDirectory, `${operationNode.name.value}.d.ts`),
      currentFilename,
      schema.hash,
      operationNode.name.value
    ),
    name: operationNode.name.value,
  };
}

class ValidationError extends Error {}

async function checkFragment(
  document: { ast: DocumentNode; document: string },
  schema: { schema: GraphQLSchema; hash: string },
  generatedDirectory: string,
  currentFilename: string
) {
  if (
    document.ast.definitions.length !== 1 ||
    document.ast.definitions[0].kind !== "FragmentDefinition"
  ) {
    throw new ValidationError(
      "Fragment definitions must only define a single fragment"
    );
  }
  let definition = document.ast.definitions[0];

  return {
    didWrite: await ensureOperationTypesAreWritten(
      schema.schema,
      document,
      { ...definition, operation: "fragment" } as any,
      path.join(generatedDirectory, `${definition.name.value}.d.ts`),
      currentFilename,
      schema.hash,
      definition.name.value
    ),
    name: definition.name.value,
  };
}
