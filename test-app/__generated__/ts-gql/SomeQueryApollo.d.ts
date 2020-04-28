/*
ts-gql-meta-begin
{
  "hash": "84550aa0d3e7746505b05634799f1a3c",
  "filename": "../../pages/apollo.tsx",
  "partial": "query SomeQueryApollo"
}
ts-gql-meta-end
*/

import * as SchemaTypes from "./@schema";

type SomeQueryApolloQueryVariables = {
  arg: SchemaTypes.Scalars['String'];
};


type SomeQueryApolloQuery = (
  { readonly __typename: 'Query' }
  & Pick<SchemaTypes.Query, 'optional'>
  & { ye: SchemaTypes.Query['something'] }
  & Something2ApolloFragment
);

type Something2ApolloFragment = (
  { readonly __typename: 'Query' }
  & Pick<SchemaTypes.Query, 'something'>
);


declare module "@ts-gql/tag" {
  interface Documents {
    SomeQueryApollo: {
      document: "\n  query SomeQueryApollo($arg: String!) {\n    optional(thing: $arg)\n    ye: something\n\n    ...Something2Apollo\n  }\n  \n\n\n  fragment Something2Apollo on Query {\n    something\n  }\n\n";
      type: "query";
      result: SomeQueryApolloQuery;
      variables: SomeQueryApolloQueryVariables;
    };
  }
}
