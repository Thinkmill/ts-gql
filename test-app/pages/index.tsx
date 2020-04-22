import { gql } from "@ts-gql/tag";

export default () => {
  return "something";
};

gql`
  query Something {
    hello
  }
`;
