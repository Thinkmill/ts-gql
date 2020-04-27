import "@ts-gql/urql";
import { gql } from "@ts-gql/tag";
import { useQuery, useMutation } from "urql";
import "../__generated__/ts-gql/SomethingOther";

const query2 = gql`
  query MyQueryUrql {
    hello
  }
`("MyQueryUrql");

const someFragment = gql`
  fragment Something2Urql on Query {
    something
  }
`("Something2Urql");

let query = gql`
  query SomeQueryUrql($arg: String!) {
    optional(thing: $arg)
    ye: something

    ...Something2Urql
  }
  ${someFragment}
`("SomeQueryUrql");

let someMutation = gql`
  mutation SomeMutationUrql($arg: String!) {
    optional(thing: $arg)
    ye: something
  }
`("SomeMutationUrql");

export default () => {
  const [{ data }] = useQuery({ query: query, variables: { arg: "" } });
  // let [mutate] = useMutation(someMutation);
  // mutate({ variables: { arg: "" } });
  data.hello;
  data.other;
  data.aTh;
  // data.aThin;

  return "something";
};
