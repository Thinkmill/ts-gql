import { gql } from "@ts-gql/tag";

// prettier-ignore
gql`
  query Thing($other: String,,) {
    optional(thing: $thing)
    other: optional(thing: $other)
  }
`;
