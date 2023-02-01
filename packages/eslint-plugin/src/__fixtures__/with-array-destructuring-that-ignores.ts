import { gql } from "@ts-gql/tag";

gql`
  query Thing {
    optional
  }
`;

const [, b] = ["a", "b"];

console.log(b);
