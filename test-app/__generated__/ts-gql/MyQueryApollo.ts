// ts-gql-integrity:81164b36d57c7d3144391ced56030ccd
/*
ts-gql-meta-begin
{
  "hash": "e0fbf4d042dfa78a6397b3cb40461772"
}
ts-gql-meta-end
*/

import * as SchemaTypes from "./@schema";
import { TypedDocumentNode } from "@ts-gql/tag";

type MyQueryApolloQueryVariables = {};


type MyQueryApolloQuery = (
  { readonly __typename: 'Query' }
  & Pick<SchemaTypes.Query, 'hello' | 'another'>
);


export type type = TypedDocumentNode<{
  type: "query";
  result: MyQueryApolloQuery;
  variables: MyQueryApolloQueryVariables;
  documents: SchemaTypes.TSGQLDocuments;
}>

declare module "./@schema" {
  interface TSGQLDocuments {
    MyQueryApollo: type;
  }
}

export const document = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyQueryApollo"},"variableDefinitions":[],"directives":[],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hello"},"arguments":[],"directives":[]},{"kind":"Field","name":{"kind":"Name","value":"another"},"arguments":[],"directives":[]}]}}]}
