import { gql } from "@ts-gql/tag";

gql`
  query Thing {
    node {
      id
      ... on SomethingNode {
        something
      }
      ... on AnotherNode {
        another
      }
    }
  }
`;
