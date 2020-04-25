/*
ts-gql-meta-begin
{
  "hash": "1bec9bf57076cf5170ce5e2e379aa408",
  "filename": "../../pages/index.tsx",
  "document": "\n  mutation SomeMutation($arg: String!) {\n    optional(thing: $arg)\n    ye: something\n  }\n"
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

declare module "@ts-gql/tag" {
  interface Documents {
    SomeMutation: {
      document: "\n  mutation SomeMutation($arg: String!) {\n    optional(thing: $arg)\n    ye: something\n  }\n";
      type: "mutation-with-required-variables";
      result: SomeMutationMutation;
      variables: SomeMutationMutationVariables;
    };
  }
}
