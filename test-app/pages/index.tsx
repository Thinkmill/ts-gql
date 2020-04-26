import "@ts-gql/apollo";
import { gql } from "@ts-gql/tag";
import { useQuery, useApolloClient } from "@apollo/client";
import "../__generated__/ts-gql/SomethingOther";

const query2 = gql`
  query MyOtherQuery {
    hello
    other
    another
    aTh: another
  }
`("MyOtherQuery");

const someFragment = gql`
  fragment Somethins on Query {
    something
  }
`("Somethins");

let query = gql`
  query SomeQuery($arg: String!) {
    optional(thing: $arg)
    ye: something

    ...Somethins
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
  data.aThing;
  // data.aThin;

  return "something";
};
