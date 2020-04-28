/*
ts-gql-meta-begin
{
  "hash": "2348bca08bbf1367fa2f8dba55b0d92f",
  "filename": "../../pages/urql.tsx",
  "partial": "mutation SomeMutationUrql"
}
ts-gql-meta-end
*/

import * as SchemaTypes from "./@schema";

type SomeMutationUrqlMutationVariables = {
  arg: SchemaTypes.Scalars['String'];
};


type SomeMutationUrqlMutation = (
  { readonly __typename: 'Mutation' }
  & Pick<SchemaTypes.Mutation, 'optional'>
  & { ye: SchemaTypes.Mutation['something'] }
);


declare module "@ts-gql/tag" {
  interface Documents {
    SomeMutationUrql: {
      document: "\n  mutation SomeMutationUrql($arg: String!) {\n    optional(thing: $arg)\n    ye: something\n  }\n\n";
      type: "mutation";
      result: SomeMutationUrqlMutation;
      variables: SomeMutationUrqlMutationVariables;
    };
  }
}
