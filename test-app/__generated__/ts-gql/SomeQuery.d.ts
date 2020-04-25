/*
ts-gql-meta-begin
{
  "hash": "68be0a4b4c956d4ccf24379f79b01436",
  "filename": "../../pages/index.tsx",
  "document": "\n  query SomeQuery($arg: String!) {\n    optional(thing: $arg)\n    ye: something\n  }\n"
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
);

declare module "@ts-gql/tag" {
  interface Documents {
    SomeQuery: {
      document: "\n  query SomeQuery($arg: String!) {\n    optional(thing: $arg)\n    ye: something\n  }\n";
      type: "query-with-required-variables";
      result: SomeQueryQuery;
      variables: SomeQueryQueryVariables;
    };
  }
}
