/*
ts-gql-meta-begin
{
  "hash": "84b94d7ccf9bd06288c6baa9705dd332",
  "filename": "../../pages/apollo.tsx",
  "partial": "query SomeQueryApollo"
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
  & Something2ApolloFragment
);

type Something2ApolloFragment = (
  { readonly __typename: 'Query' }
  & Pick<SchemaTypes.Query, 'hello'>
);


export type type = TypedDocumentNode<{
  type: "query";
  result: SomeQueryApolloQuery;
  variables: SomeQueryApolloQueryVariables;
}>

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
              "value": "Something2Apollo"
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
