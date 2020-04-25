import "@ts-gql/apollo";
import { gql } from "@ts-gql/tag";
import { useQuery, useMutation } from "@apollo/client";

const query2 = gql`
  query MyOtherQuery {
    hello
    other
    another
    aTh: another
  }
`("MyOtherQuery");

let query = gql`
  query SomeQuery($arg: String!) {
    optional(thing: $arg)
    ye: something
  }
`("SomeQuery");

let someMutation = gql`
  mutation SomeMutation($arg: String!) {
    optional(thing: $arg)
    ye: something
  }
`("SomeMutation");

export default () => {
  const { data } = useQuery(query, { variables: {} });
  let [mutate] = useMutation(someMutation);
  mutate({ variables: { arg: "" } });
  data.hello;
  data.other;
  data.aThing;
  // data.aThin;

  return "something";
};
