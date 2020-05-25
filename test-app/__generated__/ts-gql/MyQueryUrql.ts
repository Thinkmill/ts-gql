// ts-gql-integrity:faa55c24562f0f0009e5ce18ec964468
/*
ts-gql-meta-begin
{
  "hash": "f2346af5d41d3307ad98ff68b3e98fb1"
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

export const document = {
  "kind": "Document",
  "definitions": [
    {
      "kind": "OperationDefinition",
      "operation": "query",
      "name": {
        "kind": "Name",
        "value": "MyQueryUrql"
      },
      "variableDefinitions": [],
      "directives": [],
      "selectionSet": {
        "kind": "SelectionSet",
        "selections": [
          {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "hello"
            },
            "arguments": [],
            "directives": []
          }
        ]
      }
    }
  ]
}
