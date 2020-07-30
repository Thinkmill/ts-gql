import { gql } from "@ts-gql/tag";

gql`
  query Thing($thing: ID) {
    optional(thing: $thing)
  }
`;
