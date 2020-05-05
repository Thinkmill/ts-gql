/*
ts-gql-meta-begin
{
  "hash": "c12690a0b56d8808f75a161739100ca3"
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
}>

export const document = {
  "kind": "Document",
  "definitions": [
    {
      "kind": "OperationDefinition",
      "operation": "query",
      "name": {
        "kind": "Name",
        "value": "MyQueryApollo"
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
          },
          {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "another"
            },
            "arguments": [],
            "directives": []
          }
        ]
      }
    }
  ]
}
