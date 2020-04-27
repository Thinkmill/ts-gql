/*
ts-gql-meta-begin
{
  "hash": "85f7ac6b06b7996392e40457aaf4994d",
  "filename": "../../pages/apollo.tsx",
  "partial": "mutation SomeMutationApollo"
}
ts-gql-meta-end
*/

import * as SchemaTypes from "./@schema";

type SomeMutationApolloMutationVariables = {
  arg: SchemaTypes.Scalars['String'];
};


type SomeMutationApolloMutation = (
  { readonly __typename: 'Mutation' }
  & Pick<SchemaTypes.Mutation, 'optional'>
  & { ye: SchemaTypes.Mutation['something'] }
);


declare module "@ts-gql/tag" {
  interface Documents {
    SomeMutationApollo: {
      document: "\n  mutation SomeMutationApollo($arg: String!) {\n    optional(thing: $arg)\n    ye: something\n  }\n\n";
      type: "mutation-with-required-variables";
      result: SomeMutationApolloMutation;
      variables: SomeMutationApolloMutationVariables;
    };
  }
}
