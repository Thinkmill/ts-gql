/*
ts-gql-meta-begin
{
  "hash": "153a10ea03b253654e9eebbf1cd15010",
  "filename": "../../pages/index.tsx",
  "partial": "fragment Something2"
}
ts-gql-meta-end
*/

import * as SchemaTypes from "./@schema";

type Something2Fragment = (
  { readonly __typename: 'Query' }
  & Pick<SchemaTypes.Query, 'something'>
);

    
    declare module "@ts-gql/tag" {
      interface Documents {
        Something2: {
          document: "\n  fragment Something2 on Query {\n    something\n  }\n\n";
          type: "fragment";
          result: Something2Fragment;
          variables: undefined;
        };
      }
    }
    