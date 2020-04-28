/*
ts-gql-meta-begin
{
  "hash": "365a775d2987f2bd1b013db1e2747753",
  "filename": "../../pages/apollo.tsx",
  "partial": "query MyQueryApollo"
}
ts-gql-meta-end
*/

import * as SchemaTypes from "./@schema";

type MyQueryApolloQueryVariables = {};


type MyQueryApolloQuery = (
  { readonly __typename: 'Query' }
  & Pick<SchemaTypes.Query, 'hello' | 'another'>
);


declare module "@ts-gql/tag" {
  interface Documents {
    MyQueryApollo: {
      document: "\n  query MyQueryApollo {\n    hello\n    another\n  }\n\n";
      type: "query";
      result: MyQueryApolloQuery;
      variables: MyQueryApolloQueryVariables;
    };
  }
}
