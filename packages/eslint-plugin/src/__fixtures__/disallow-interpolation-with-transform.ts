import { gql } from "@ts-gql/tag";

const x: any = undefined;

gql`
  query Thing {
    something
  }
  ${
    // @ts-ignore
    x
  }
`;
