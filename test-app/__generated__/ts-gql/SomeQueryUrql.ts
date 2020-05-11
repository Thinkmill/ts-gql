// ts-gql-integrity:bf8bcddbc7cd09504869a167ff7f2cc1
/*
ts-gql-meta-begin
{
  "hash": "1c4c0a81655082ca5729a96247ef6d8e"
}
ts-gql-meta-end
*/

import * as SchemaTypes from "./@schema";
import { TypedDocumentNode } from "@ts-gql/tag";

type SomeQueryUrqlQueryVariables = {
  arg: SchemaTypes.Scalars['String'];
};


type SomeQueryUrqlQuery = (
  { readonly __typename: 'Query' }
  & Pick<SchemaTypes.Query, 'optional'>
  & { ye: SchemaTypes.Query['something'] }
  & Something2Urql_xFragment
);

type Something2Urql_xFragment = (
  { readonly __typename: 'Query' }
  & Pick<SchemaTypes.Query, 'something'>
);


export type type = TypedDocumentNode<{
  type: "query";
  result: SomeQueryUrqlQuery;
  variables: SomeQueryUrqlQueryVariables;
  documents: SchemaTypes.TSGQLDocuments;
}>

declare module "./@schema" {
  interface TSGQLDocuments {
    SomeQueryUrql: type;
  }
}

export const document = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SomeQueryUrql"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"arg"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},"directives":[]}],"directives":[],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"optional"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"thing"},"value":{"kind":"Variable","name":{"kind":"Name","value":"arg"}}}],"directives":[]},{"kind":"Field","alias":{"kind":"Name","value":"ye"},"name":{"kind":"Name","value":"something"},"arguments":[],"directives":[]},{"kind":"FragmentSpread","name":{"kind":"Name","value":"Something2Urql_x"},"directives":[]}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Something2Urql_x"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Query"}},"directives":[],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"something"},"arguments":[],"directives":[]}]}}]}
