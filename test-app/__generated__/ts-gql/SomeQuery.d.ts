/*
ts-gql-meta-begin
{
  "hash": "11daa30ad64a233d30f2584915d5d528",
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
  & Something2Fragment
);

type Something2Fragment = (
  { readonly __typename: 'Query' }
  & Pick<SchemaTypes.Query, 'something'>
);

    
    declare module "@ts-gql/tag" {
      interface Documents {
        SomeQuery: {
          document: "\n  query SomeQuery($arg: String!) {\n    optional(thing: $arg)\n    ye: something\n\n    ...Something2\n  }\n  \n\n\n  fragment Something2 on Query {\n    something\n  }\n\n";
          type: "query-with-required-variables";
          result: SomeQueryQuery;
          variables: SomeQueryQueryVariables;
        };
      }
    }
    