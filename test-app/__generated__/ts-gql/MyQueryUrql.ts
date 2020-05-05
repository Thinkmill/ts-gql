/*
ts-gql-meta-begin
{
  "hash": "be887feb51f7a40a74eff325563dc0c8",
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
