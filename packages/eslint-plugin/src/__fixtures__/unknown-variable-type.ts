import { gql } from "@ts-gql/tag";

gql`
  query Thing($thing: DoesNotExist) {
    optional(thing: $thing)
  }
`;
