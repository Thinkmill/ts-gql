// ts-gql-integrity:872c09e2466a27c820bbc3192720a26a
/*
ts-gql-meta-begin
{
  "hash": "3e53801c3d5f1bd3eab0dd1dcb0afc92"
}
ts-gql-meta-end
*/

import * as SchemaTypes from "./@schema";
import { TypedDocumentNode } from "@ts-gql/tag";

type SomeQueryApolloQueryVariables = {
  arg: SchemaTypes.Scalars['String'];
};


type SomeQueryApolloQuery = (
  { readonly __typename: 'Query' }
  & Pick<SchemaTypes.Query, 'optional'>
  & { ye: SchemaTypes.Query['something'] }
  & Something2Apollo_xFragment
);

type Something2Apollo_xFragment = (
  { readonly __typename: 'Query' }
  & Pick<SchemaTypes.Query, 'hello'>
);


export type type = TypedDocumentNode<{
  type: "query";
  result: SomeQueryApolloQuery;
  variables: SomeQueryApolloQueryVariables;
  documents: SchemaTypes.TSGQLDocuments;
}>

declare module "./@schema" {
  interface TSGQLDocuments {
    SomeQueryApollo: type;
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
        "value": "SomeQueryApollo"
      },
      "variableDefinitions": [
        {
          "kind": "VariableDefinition",
          "variable": {
            "kind": "Variable",
            "name": {
              "kind": "Name",
              "value": "arg"
            }
          },
          "type": {
            "kind": "NonNullType",
            "type": {
              "kind": "NamedType",
              "name": {
                "kind": "Name",
                "value": "String"
              }
            }
          },
          "directives": []
        }
      ],
      "directives": [],
      "selectionSet": {
        "kind": "SelectionSet",
        "selections": [
          {
            "kind": "Field",
            "name": {
              "kind": "Name",
              "value": "optional"
            },
            "arguments": [
              {
                "kind": "Argument",
                "name": {
                  "kind": "Name",
                  "value": "thing"
                },
                "value": {
                  "kind": "Variable",
                  "name": {
                    "kind": "Name",
                    "value": "arg"
                  }
                }
              }
            ],
            "directives": []
          },
          {
            "kind": "Field",
            "alias": {
              "kind": "Name",
              "value": "ye"
            },
            "name": {
              "kind": "Name",
              "value": "something"
            },
            "arguments": [],
            "directives": []
          },
          {
            "kind": "FragmentSpread",
            "name": {
              "kind": "Name",
              "value": "Something2Apollo_x"
            },
            "directives": []
          }
        ]
      }
    },
    {
      "kind": "FragmentDefinition",
      "name": {
        "kind": "Name",
        "value": "Something2Apollo_x"
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
