import { PluginFunction, Types } from "@graphql-codegen/plugin-helpers";
import { LoadedFragment } from "../visitor-plugin-common";
import {
  concatAST,
  FragmentDefinitionNode,
  GraphQLSchema,
  Kind,
} from "graphql";
import { TypeScriptDocumentsPluginConfig } from "./config";
import { TypeScriptDocumentsVisitor } from "./visitor";

export type { TypeScriptDocumentsPluginConfig } from "./config";

import { ASTNode, visit } from "graphql";

type VisitFn = typeof visit;
type NewVisitor = Partial<Parameters<VisitFn>[1]>;
type OldVisitor = {
  enter?: Partial<
    Record<keyof NewVisitor, NonNullable<NewVisitor[keyof NewVisitor]>["enter"]>
  >;
  leave?: Partial<
    Record<keyof NewVisitor, NonNullable<NewVisitor[keyof NewVisitor]>["leave"]>
  >;
} & NewVisitor;

function oldVisit(
  root: ASTNode,
  { enter: enterVisitors, leave: leaveVisitors, ..._newVisitor }: OldVisitor
): any {
  const newVisitor: any = _newVisitor;
  if (typeof enterVisitors === "object") {
    for (const key in enterVisitors) {
      newVisitor[key] ||= {};
      newVisitor[key].enter = (enterVisitors as any)[key];
    }
  }
  if (typeof leaveVisitors === "object") {
    for (const key in leaveVisitors) {
      newVisitor[key] ||= {};
      newVisitor[key].leave = (leaveVisitors as any)[key];
    }
  }
  return visit(root, newVisitor);
}

export const typescriptOperationsPlugin: PluginFunction<
  TypeScriptDocumentsPluginConfig,
  Types.ComplexPluginOutput
> = (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: TypeScriptDocumentsPluginConfig
) => {
  const allAst = concatAST(documents.map((v) => v.document!));

  const allFragments: LoadedFragment[] = [
    ...(
      allAst.definitions.filter(
        (d) => d.kind === Kind.FRAGMENT_DEFINITION
      ) as FragmentDefinitionNode[]
    ).map((fragmentDef) => ({
      node: fragmentDef,
      name: fragmentDef.name.value,
      onType: fragmentDef.typeCondition.name.value,
      isExternal: false,
    })),
  ];

  const visitor = new TypeScriptDocumentsVisitor(schema, config, allFragments);

  const visitorResult = oldVisit(allAst, {
    leave: visitor as any,
  });

  let content = visitorResult.definitions.join("\n");

  return {
    prepend: [
      ...visitor.getImports(),
      ...visitor.getGlobalDeclarations(visitor.config.noExport),
    ],
    content,
  };
};

export { TypeScriptDocumentsVisitor };
