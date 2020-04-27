import "@ts-gql/apollo";
import { gql } from "@ts-gql/tag";
import { useQuery, useApolloClient } from "@apollo/client";
import "../__generated__/ts-gql/SomethingOther";

const query2 = gql`
  query MyQueryApollo {
    hello
    another
  }
`("MyQueryApollo");

const someFragment = gql`
  fragment Something2Apollo on Query {
    something
  }
`("Something2Apollo");

let query = gql`
  query SomeQueryApollo($arg: String!) {
    optional(thing: $arg)
    ye: something

    ...Something2Apollo
  }
  ${someFragment}
`("SomeQueryApollo");

let someMutation = gql`
  mutation SomeMutationApollo($arg: String!) {
    optional(thing: $arg)
    ye: something
  }
`("SomeMutationApollo");

export default () => {
  let client = useApolloClient();

  const { data } = useQuery(query2);
  data.hello;
  data.another;
  // let [mutate] = useMutation(someMutation);
  // mutate({ variables: { arg: "" } });
  data.hello;
  data.other;
  data.aTh;
  // data.aThin;

  return "something";
};
