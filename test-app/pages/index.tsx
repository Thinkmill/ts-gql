import "@ts-gql/apollo";
import { gql } from "@ts-gql/tag";
import { useQuery } from "@apollo/client";

const query2 = gql`
  query MyOtherQuery {
    hello
    other
    another
    aThing: another
  }
`("MyOtherQuery");

export default () => {
  const { data } = useQuery(query2);
  data.hello;
  data.other;
  data.aThing;
  data.aThin;

  return "something";
};
