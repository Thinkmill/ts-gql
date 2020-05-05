/*
ts-gql-meta-begin
{
  "hash": "c189a63de17ba16c019a5ab5ca330c75",
  "filename": "../../pages/urql.tsx",
  "partial": "fragment Something2Urql"
}
ts-gql-meta-end
*/

import * as SchemaTypes from "./@schema";
import { TypedDocumentNode } from "@ts-gql/tag";

type Something2UrqlFragment = (
  { readonly __typename: 'Query' }
  & Pick<SchemaTypes.Query, 'something'>
);


export type type = TypedDocumentNode<{
  type: "fragment";
  result: Something2UrqlFragment;
}>

export const document = {
  "kind": "Document",
  "definitions": [
    {
      "kind": "FragmentDefinition",
      "name": {
        "kind": "Name",
        "value": "Something2Urql"
      },
      "typeCondition": {
        "kind": "NamedType",
        "name": {
          "kind": "Name",
          "value": "Query"
        }
      },
      "directives": [],
      "selectionSet": {
        "kind": "SelectionSet",
        "selections": [
          {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "something"
            },
            "arguments": [],
            "directives": []
          }
        ]
      }
    }
  ]
}
