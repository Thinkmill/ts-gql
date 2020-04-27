import "@ts-gql/apollo";
import { gql } from "@ts-gql/tag";
import { useQuery, useApolloClient } from "@apollo/client";
import "../__generated__/ts-gql/SomethingOther";

const query2 = gql`
  query MyQuery {
    hello
  }
`("MyQuery");

const someFragment = gql`
  fragment Something2 on Query {
    something
  }
`("Something2");

let query = gql`
  query SomeQuery($arg: String!) {
    optional(thing: $arg)
    ye: something

    ...Something2
  }
  ${someFragment}
`("SomeQuery");

let someMutation = gql`
  mutation SomeMutation($arg: String!) {
    optional(thing: $arg)
    ye: something
  }
`("SomeMutation");

export default () => {
  let client = useApolloClient();

  const { data } = useQuery(query2, void 0);
  // let [mutate] = useMutation(someMutation);
  // mutate({ variables: { arg: "" } });
  data.hello;
  data.other;
  data.aTh;
  // data.aThin;

  return "something";
};
