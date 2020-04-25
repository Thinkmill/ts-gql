/*
ts-gql-meta-begin
{
  "hash": "c941fe95578d632859d05e201a9face3",
  "filename": "../../pages/index.tsx",
  "document": "\n  query MyOtherQuery {\n    hello\n    other\n    another\n    aTh: another\n  }\n"
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
      document: "\n  query MyOtherQuery {\n    hello\n    other\n    another\n    aTh: another\n  }\n";
      type: "query";
      result: MyOtherQueryQuery;
      variables: undefined;
    };
  }
}
