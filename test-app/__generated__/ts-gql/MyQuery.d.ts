/*
ts-gql-meta-begin
{
  "hash": "1b2c07ec819c249efde9717f714dcac4",
  "filename": "../../pages/index.tsx",
  "partial": "query MyQuery"
}
ts-gql-meta-end
*/

import * as SchemaTypes from "./@schema";

type MyQueryQueryVariables = {};


type MyQueryQuery = (
  { readonly __typename: 'Query' }
  & Pick<SchemaTypes.Query, 'hello'>
);


declare module "@ts-gql/tag" {
  interface Documents {
    MyQuery: {
      document: "\n  query MyQuery {\n    hello\n  }\n\n";
      type: "query";
      result: MyQueryQuery;
      variables: undefined;
    };
  }
}
