import type {
  NameNode,
  OperationDefinitionNode,
  FragmentDefinitionNode,
} from "graphql";

export type Position = {
  line: number;
  column: number;
};

export type SourceLocation = {
  start: Position;
  end?: Position;
};

export type FullSourceLocation = {
  start: Position;
  end: Position;
};

export type CompilerError = {
  filename: string;
  message: string;
  loc?: SourceLocation;
};

export type NamedOperationDefinitionNode = Omit<
  OperationDefinitionNode,
  "name"
> & {
  readonly name: NameNode;
};

export type NamedFragmentDefinitionNode = FragmentDefinitionNode;

export type TSGQLDocument = {
  filename: string;
  loc: FullSourceLocation;
  node: NamedOperationDefinitionNode | NamedFragmentDefinitionNode;
};
