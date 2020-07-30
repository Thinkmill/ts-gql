import { gql } from "@ts-gql/tag";

gql`
  query Thing($other: String) {
    optional(thing: $thing)
    other: optional(thing: $other)
  }
`;
