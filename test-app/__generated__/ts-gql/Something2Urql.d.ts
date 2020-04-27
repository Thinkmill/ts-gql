/*
ts-gql-meta-begin
{
  "hash": "1eb96bc58320553be2fffc4102b7c54e",
  "filename": "../../pages/urql.tsx",
  "partial": "fragment Something2Urql"
}
ts-gql-meta-end
*/

import * as SchemaTypes from "./@schema";

type Something2UrqlFragment = (
  { readonly __typename: 'Query' }
  & Pick<SchemaTypes.Query, 'something'>
);


declare module "@ts-gql/tag" {
  interface Documents {
    Something2Urql: {
      document: "\n  fragment Something2Urql on Query {\n    something\n  }\n\n";
      type: "fragment";
      result: Something2UrqlFragment;
      variables: undefined;
    };
  }
}
