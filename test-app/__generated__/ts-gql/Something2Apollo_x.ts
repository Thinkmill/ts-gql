// ts-gql-integrity:aa2652a3cc05cc275226744d806fd3b2
/*
ts-gql-meta-begin
{
  "hash": "c3d61f8e1207d4a260b1f73d1d9fe861"
}
ts-gql-meta-end
*/

import * as SchemaTypes from "./@schema";
import { TypedDocumentNode } from "@ts-gql/tag";

type Something2Apollo_xFragment = (
  { readonly __typename: 'Query' }
  & Pick<SchemaTypes.Query, 'hello'>
);


export type type = TypedDocumentNode<{
  type: "fragment";
  result: Something2Apollo_xFragment;
  documents: SchemaTypes.TSGQLDocuments;
}>

declare module "./@schema" {
  interface TSGQLDocuments {
    Something2Apollo_x: type;
  }
}

export const document = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"Something2Apollo_x"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Query"}},"directives":[],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hello"},"arguments":[],"directives":[]}]}}]}
