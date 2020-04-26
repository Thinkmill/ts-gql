/*
ts-gql-meta-begin
{
  "hash": "530b6407901f6ef6830636284cc0e82d",
  "filename": "../../pages/index.tsx",
  "partial": "query MyOtherQuery"
}
ts-gql-meta-end
*/

import * as SchemaTypes from "./@schema";

type MyOtherQueryQueryVariables = {};


type MyOtherQueryQuery = (
  { readonly __typename: 'Query' }
  & Pick<SchemaTypes.Query, 'hello' | 'other' | 'another'>
  & { aTh: SchemaTypes.Query['another'] }
);


declare module "@ts-gql/tag" {
  interface Documents {
    MyOtherQuery: {
      document: "\n  query MyOtherQuery {\n    hello\n    other\n    another\n    aTh: another\n  }\n\n";
      type: "query";
      result: MyOtherQueryQuery;
      variables: undefined;
    };
  }
}
