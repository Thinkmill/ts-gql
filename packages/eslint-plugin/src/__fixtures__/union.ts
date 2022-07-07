import { gql } from "@ts-gql/tag";

gql`
  query Thing {
    union {
      ... on A {
        a
      }
      ... on B {
        b
      }
    }
  }
`;
