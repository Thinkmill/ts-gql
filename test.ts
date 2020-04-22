import { useQuery, QueryHookOptions, QueryResult } from "@apollo/client";
import _gql from "graphql-tag";
import { DocumentNode } from "graphql";

type BaseTypedDocument = { document: string; result: any };

type BaseTypedQuery = BaseTypedDocument & {
  type: "query";
};

type BaseTypedMutation = BaseTypedDocument & {
  type: "mutation";
};

type BaseTypedQueryWithVariables = BaseTypedDocument & {
  type: "query-with-variables";
  variables: Record<string, any>;
};

type BaseTypedMutationWithVariables = BaseTypedDocument & {
  type: "mutation-with-variables";
  variables: Record<string, any>;
};

type BaseOperations =
  | BaseTypedQuery
  | BaseTypedMutation
  | BaseTypedQueryWithVariables
  | BaseTypedMutationWithVariables;

type BaseTypedFragment = BaseTypedDocument & {
  type: "fragment";
};

type BaseDocumentTypes = BaseOperations | BaseTypedFragment;

type TypedDocumentNode<
  TypedDocument extends BaseDocumentTypes
> = DocumentNode & { ___type: TypedDocument };

type DocumentResult<
  Node extends TypedDocumentNode<BaseDocumentTypes>
> = Node["___type"]["result"];

type DocumentVariables<
  Node extends
    | TypedDocumentNode<BaseTypedQueryWithVariables>
    | TypedDocumentNode<BaseTypedMutationWithVariables>
> = Node["___type"]["variables"];

interface Documents {
  Thing: {
    type: "query";
    document: "query Thing {\n yes\n }\n}";
    result: { yes: string };
    variables: undefined;
  };
  OtherThing: {
    type: "query-with-variables";
    document: "query OtherThing {\n yes\n }\n}";
    result: { yes: string };
    variables: { thing: boolean };
  };
}

function gql(
  strings: readonly string[],
  ...interpolations: TypedDocumentNode<BaseTypedFragment>[]
) {
  return <Key extends keyof Documents>(
    name: Key
  ): TypedDocumentNode<Documents[Key]> => {
    // @ts-ignore
    return _gql(strings, ...interpolations);
  };
}

declare module "@apollo/client" {
  export function useQuery<
    TTypedDocumentNode extends TypedDocumentNode<BaseTypedQueryWithVariables>
  >(
    query: TTypedDocumentNode,
    options: Omit<
      QueryHookOptions<
        DocumentResult<TTypedDocumentNode>,
        DocumentVariables<TTypedDocumentNode>
      >,
      "variables"
    > & { variables: DocumentVariables<TTypedDocumentNode> }
  ): QueryResult<
    DocumentResult<TTypedDocumentNode>,
    DocumentVariables<TTypedDocumentNode>
  >;
  export function useQuery<
    TTypedDocumentNode extends TypedDocumentNode<BaseTypedQuery>
  >(
    query: TTypedDocumentNode,
    options?: Omit<
      QueryHookOptions<DocumentResult<TTypedDocumentNode>, undefined>,
      "variables"
    >
  ): QueryResult<DocumentResult<TTypedDocumentNode>, undefined>;
}

let query = gql`
  query Thing {
    yes
  }
`("Thing");

let { data } = useQuery(query);

let query2 = gql`
  query OtherThing {
    yes
  }
`("OtherThing");

let { data: data2 } = useQuery(query2, { variables: { thing: false } });
