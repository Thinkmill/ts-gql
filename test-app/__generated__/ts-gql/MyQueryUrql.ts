/*
ts-gql-meta-begin
{
  "hash": "a5f4fcf492d816e52a66a44e7e147881",
  "filename": "../../pages/urql.tsx",
  "partial": "query MyQueryUrql"
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
}>

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
