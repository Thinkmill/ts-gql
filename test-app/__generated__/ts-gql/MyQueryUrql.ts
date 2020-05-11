// ts-gql-integrity:6313a5f378da46a8ece79aa9af65a430
/*
ts-gql-meta-begin
{
  "hash": "bb6f31b5f9c07bdb5e64071cb59f4ddc"
}
ts-gql-meta-end
*/

import * as SchemaTypes from "./@schema";
import { TypedDocumentNode } from "@ts-gql/tag";

type MyQueryUrqlQueryVariables = {};


type MyQueryUrqlQuery = (
  { readonly __typename: 'Query' }
  & Pick<SchemaTypes.Query, 'hello'>
);


export type type = TypedDocumentNode<{
  type: "query";
  result: MyQueryUrqlQuery;
  variables: MyQueryUrqlQueryVariables;
  documents: SchemaTypes.TSGQLDocuments;
}>

declare module "./@schema" {
  interface TSGQLDocuments {
    MyQueryUrql: type;
  }
}

export const document = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyQueryUrql"},"variableDefinitions":[],"directives":[],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hello"},"arguments":[],"directives":[]}]}}]}
