/*
ts-gql-meta-begin
{
  "hash": "cfae561ae20de958865a2105ea184c29",
  "filename": "../../pages/urql.tsx",
  "partial": "query MyQueryUrql"
}
ts-gql-meta-end
*/

import * as SchemaTypes from "./@schema";

type MyQueryUrqlQueryVariables = {};


type MyQueryUrqlQuery = (
  { readonly __typename: 'Query' }
  & Pick<SchemaTypes.Query, 'hello'>
);


declare module "@ts-gql/tag" {
  interface Documents {
    MyQueryUrql: {
      document: "\n  query MyQueryUrql {\n    hello\n  }\n\n";
      type: "query";
      result: MyQueryUrqlQuery;
      variables: MyQueryUrqlQueryVariables;
    };
  }
}
