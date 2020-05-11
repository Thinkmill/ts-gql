// ts-gql-integrity:dac47e7bca7ae4c201340bb911e30d60
/*
ts-gql-meta-begin
{
  "hash": "f5512ceeab45ded50b62a5d2068de82c"
}
ts-gql-meta-end
*/

import * as SchemaTypes from "./@schema";
import { TypedDocumentNode } from "@ts-gql/tag";

type SomeMutationApolloMutationVariables = {
  arg: SchemaTypes.Scalars['String'];
};


type SomeMutationApolloMutation = (
  { readonly __typename: 'Mutation' }
  & Pick<SchemaTypes.Mutation, 'optional'>
  & { ye: SchemaTypes.Mutation['something'] }
);


export type type = TypedDocumentNode<{
  type: "mutation";
  result: SomeMutationApolloMutation;
  variables: SomeMutationApolloMutationVariables;
  documents: SchemaTypes.TSGQLDocuments;
}>

declare module "./@schema" {
  interface TSGQLDocuments {
    SomeMutationApollo: type;
  }
}

export const document = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SomeMutationApollo"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"arg"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},"directives":[]}],"directives":[],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"optional"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"thing"},"value":{"kind":"Variable","name":{"kind":"Name","value":"arg"}}}],"directives":[]},{"kind":"Field","alias":{"kind":"Name","value":"ye"},"name":{"kind":"Name","value":"something"},"arguments":[],"directives":[]}]}}]}
