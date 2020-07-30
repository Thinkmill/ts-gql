import { gql } from "@ts-gql/tag";

gql`
  query Thing {
    optional(thing: $thing)
  }
`;
