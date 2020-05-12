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
