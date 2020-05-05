/*
ts-gql-meta-begin
{
  "hash": "ead33aea51a69e729606e382c76c2df4",
  "filename": "../../pages/apollo.tsx",
  "partial": "fragment Something2Apollo"
}
ts-gql-meta-end
*/

import * as SchemaTypes from "./@schema";
import { TypedDocumentNode } from "@ts-gql/tag";

type Something2ApolloFragment = (
  { readonly __typename: 'Query' }
  & Pick<SchemaTypes.Query, 'hello'>
);


export type type = TypedDocumentNode<{
  type: "fragment";
  result: Something2ApolloFragment;
}>

export const document = {
  "kind": "Document",
  "definitions": [
    {
      "kind": "FragmentDefinition",
      "name": {
        "kind": "Name",
        "value": "Something2Apollo"
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
