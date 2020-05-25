// ts-gql-integrity:2be86fa860076fd2bff9fcacdf3563db
/*
ts-gql-meta-begin
{
  "hash": "2f5d1b3d6a09a3c37fb44c2d52f3714f"
}
ts-gql-meta-end
*/

import * as SchemaTypes from "./@schema";
import { TypedDocumentNode } from "@ts-gql/tag";

type Something2Urql_xFragment = (
  { readonly __typename: 'Query' }
  & Pick<SchemaTypes.Query, 'something'>
);


export type type = TypedDocumentNode<{
  type: "fragment";
  result: Something2Urql_xFragment;
  documents: SchemaTypes.TSGQLDocuments;
}>

declare module "./@schema" {
  interface TSGQLDocuments {
    Something2Urql_x: type;
  }
}

export const document = {
  "kind": "Document",
  "definitions": [
    {
      "kind": "FragmentDefinition",
      "name": {
        "kind": "Name",
        "value": "Something2Urql_x"
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
