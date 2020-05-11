// ts-gql-integrity:2c8233df98cc217f096110e7ca671437
/*
ts-gql-meta-begin
{
  "hash": "9fadf9aded6eba5f143aac40cdaca969"
}
ts-gql-meta-end
*/

import * as SchemaTypes from "./@schema";
import { TypedDocumentNode } from "@ts-gql/tag";

type SomeMutationUrqlMutationVariables = {
  arg: SchemaTypes.Scalars['String'];
};


type SomeMutationUrqlMutation = (
  { readonly __typename: 'Mutation' }
  & Pick<SchemaTypes.Mutation, 'optional'>
  & { ye: SchemaTypes.Mutation['something'] }
);


export type type = TypedDocumentNode<{
  type: "mutation";
  result: SomeMutationUrqlMutation;
  variables: SomeMutationUrqlMutationVariables;
  documents: SchemaTypes.TSGQLDocuments;
}>

declare module "./@schema" {
  interface TSGQLDocuments {
    SomeMutationUrql: type;
  }
}

export const document = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SomeMutationUrql"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"arg"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},"directives":[]}],"directives":[],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"optional"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"thing"},"value":{"kind":"Variable","name":{"kind":"Name","value":"arg"}}}],"directives":[]},{"kind":"Field","alias":{"kind":"Name","value":"ye"},"name":{"kind":"Name","value":"something"},"arguments":[],"directives":[]}]}}]}
