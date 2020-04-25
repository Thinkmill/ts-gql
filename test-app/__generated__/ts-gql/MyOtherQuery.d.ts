/*
ts-gql-meta-begin
{
  "hash": "3e12ec99af4dad5a582fcecb65807be3",
  "filename": "../../pages/index.tsx",
  "document": "\n  query MyOtherQuery {\n    hello\n    other\n    another\n    aThing: another\n  }\n"
}
ts-gql-meta-end
*/

import * as SchemaTypes from "./@schema";

type MyOtherQueryQueryVariables = {};


type MyOtherQueryQuery = (
  { readonly __typename: 'Query' }
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
