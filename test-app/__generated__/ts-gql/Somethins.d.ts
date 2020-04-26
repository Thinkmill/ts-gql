/*
ts-gql-meta-begin
{
  "hash": "0f72570158ea6db7370944763b1d8e5a",
  "filename": "../../pages/index.tsx",
  "partial": "fragment Somethins"
}
ts-gql-meta-end
*/

import * as SchemaTypes from "./@schema";

type SomethinsFragment = (
  { readonly __typename: 'Query' }
  & Pick<SchemaTypes.Query, 'something'>
);


declare module "@ts-gql/tag" {
  interface Documents {
    Somethins: {
      document: "\n  fragment Somethins on Query {\n    something\n  }\n\n";
      type: "fragment";
      result: SomethinsFragment;
      variables: undefined;
    };
  }
}
