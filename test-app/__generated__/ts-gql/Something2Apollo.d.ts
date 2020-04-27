/*
ts-gql-meta-begin
{
  "hash": "e81b2fe25129663c75e86c90bb9b896b",
  "filename": "../../pages/apollo.tsx",
  "partial": "fragment Something2Apollo"
}
ts-gql-meta-end
*/

import * as SchemaTypes from "./@schema";

type Something2ApolloFragment = (
  { readonly __typename: 'Query' }
  & Pick<SchemaTypes.Query, 'something'>
);


declare module "@ts-gql/tag" {
  interface Documents {
    Something2Apollo: {
      document: "\n  fragment Something2Apollo on Query {\n    something\n  }\n\n";
      type: "fragment";
      result: Something2ApolloFragment;
      variables: undefined;
    };
  }
}
