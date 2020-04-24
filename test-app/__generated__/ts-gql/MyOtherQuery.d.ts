/*
ts-gql-meta-begin
{
  "hash": "3dcd1a7f08d7574c080f80d87333f1cf",
  "filename": "../../pages/index.tsx",
  "document": "\n  query MyOtherQuery {\n    hello\n    other\n    another\n    aThing: another\n  }\n"
}
ts-gql-meta-end
*/

import * as SchemaTypes from "./@schema";

type MyOtherQueryQueryVariables = {};


type MyOtherQueryQuery = (
  { readonly __typename?: 'Query' }
  & Pick<SchemaTypes.Query, 'hello' | 'other' | 'another'>
  & { aThing: SchemaTypes.Query['another'] }
);

declare module "@ts-gql/tag" {
  interface Documents {
    MyOtherQuery: {
      document: "\n  query MyOtherQuery {\n    hello\n    other\n    another\n    aThing: another\n  }\n";
      type: "query";
      result: MyOtherQueryQuery;
      variables: MyOtherQueryQueryVariables;
    };
  }
}
