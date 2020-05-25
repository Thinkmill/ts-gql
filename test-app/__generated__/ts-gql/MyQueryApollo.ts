// ts-gql-integrity:3d87730f831a23f2399eb2c8d6901c3e
/*
ts-gql-meta-begin
{
  "hash": "d9d42135bda2d1adc058f0bd91b9f146"
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
