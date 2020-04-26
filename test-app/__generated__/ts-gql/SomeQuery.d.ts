/*
ts-gql-meta-begin
{
  "hash": "847281bb73f932c5243cc46e560ab581",
  "filename": "../../pages/index.tsx",
  "partial": "query SomeQuery"
}
ts-gql-meta-end
*/

import * as SchemaTypes from "./@schema";

type SomeQueryQueryVariables = {
  arg: SchemaTypes.Scalars['String'];
};


type SomeQueryQuery = (
  { readonly __typename: 'Query' }
  & Pick<SchemaTypes.Query, 'optional'>
  & { ye: SchemaTypes.Query['something'] }
  & SomethinsFragment
);

type SomethinsFragment = (
  { readonly __typename: 'Query' }
  & Pick<SchemaTypes.Query, 'something'>
);


declare module "@ts-gql/tag" {
  interface Documents {
    SomeQuery: {
      document: "\n  query SomeQuery($arg: String!) {\n    optional(thing: $arg)\n    ye: something\n\n    ...Somethins\n  }\n  \n\n\n  fragment Somethins on Query {\n    something\n  }\n\n";
      type: "query-with-required-variables";
      result: SomeQueryQuery;
      variables: SomeQueryQueryVariables;
    };
  }
}
