import { gql } from "@ts-gql/tag/no-transform";

const x: any = undefined;

gql`
  query Thing {
    something
    ...Blah_x
    ...Other_x
  }
  ${x}
` as import(// @ts-ignore
"../__generated__/ts-gql/Thing").type;
