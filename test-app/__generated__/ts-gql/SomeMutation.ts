/*
ts-gql-meta-begin
{
  "hash": "ed592edf117875c71d0232782f124f6b",
  "filename": "../../pages/index.tsx",
  "partial": "mutation SomeMutation"
}
ts-gql-meta-end
*/

import * as SchemaTypes from "./@schema";

type SomeMutationMutationVariables = {
  arg: SchemaTypes.Scalars['String'];
};


type SomeMutationMutation = (
  { readonly __typename: 'Mutation' }
  & Pick<SchemaTypes.Mutation, 'optional'>
  & { ye: SchemaTypes.Mutation['something'] }
);


export type type = {
  document: "\n  mutation SomeMutation($arg: String!) {\n    optional(thing: $arg)\n    ye: something\n  }\n\n";
  type: "mutation-with-required-variables";
  result: SomeMutationMutation;
  variables: SomeMutationMutationVariables;
};
