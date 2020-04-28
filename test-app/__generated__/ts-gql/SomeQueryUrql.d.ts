/*
ts-gql-meta-begin
{
  "hash": "721f175e57f072c024a285ae89b15dc4",
  "filename": "../../pages/urql.tsx",
  "partial": "query SomeQueryUrql"
}
ts-gql-meta-end
*/

import * as SchemaTypes from "./@schema";

type SomeQueryUrqlQueryVariables = {
  arg: SchemaTypes.Scalars['String'];
};


type SomeQueryUrqlQuery = (
  { readonly __typename: 'Query' }
  & Pick<SchemaTypes.Query, 'optional'>
  & { ye: SchemaTypes.Query['something'] }
  & Something2UrqlFragment
);

type Something2UrqlFragment = (
  { readonly __typename: 'Query' }
  & Pick<SchemaTypes.Query, 'something'>
);


declare module "@ts-gql/tag" {
  interface Documents {
    SomeQueryUrql: {
      document: "\n  query SomeQueryUrql($arg: String!) {\n    optional(thing: $arg)\n    ye: something\n\n    ...Something2Urql\n  }\n  \n\n\n  fragment Something2Urql on Query {\n    something\n  }\n\n";
      type: "query";
      result: SomeQueryUrqlQuery;
      variables: SomeQueryUrqlQueryVariables;
    };
  }
}
