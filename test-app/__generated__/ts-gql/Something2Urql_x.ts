// ts-gql-integrity:629aabc50da24b7b92aa753aae69089d
/*
ts-gql-meta-begin
{
  "hash": "51006bc50c355dbb9e625b93551f841e"
}
ts-gql-meta-end
*/

import * as SchemaTypes from "./@schema";
import { TypedDocumentNode } from "@ts-gql/tag";

type Something2Urql_xFragment = (
  { readonly __typename: 'Query' }
  & Pick<SchemaTypes.Query, 'something'>
);


export type type = TypedDocumentNode<{
  type: "fragment";
  result: Something2Urql_xFragment;
  documents: SchemaTypes.TSGQLDocuments;
}>

declare module "./@schema" {
  interface TSGQLDocuments {
    Something2Urql_x: type;
  }
}

export const document = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Something2Urql_x"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Query"}},"directives":[],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"something"},"arguments":[],"directives":[]}]}}]}
