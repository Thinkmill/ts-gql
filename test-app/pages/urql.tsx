import { gql } from "@ts-gql/tag";
import { useQuery } from "urql";
import "../__generated__/ts-gql/SomethingOther";

const query2 = gql`
  query MyQueryUrql {
    hello
  }
` as import("../__generated__/ts-gql/MyQueryUrql").type;

const someFragment = gql`
  fragment Something2Urql_x on Query {
    something
  }
` as import("../__generated__/ts-gql/Something2Urql_x").type;

let query = gql`
  query SomeQueryUrql($arg: String!) {
    optional(thing: $arg)
    ye: something

    ...Something2Urql_x
  }
` as import("../__generated__/ts-gql/SomeQueryUrql").type;

let someMutation = gql`
  mutation SomeMutationUrql($arg: String!) {
    optional(thing: $arg)
    ye: something
  }
` as import("../__generated__/ts-gql/SomeMutationUrql").type;

export default () => {
  const [{ data }] = useQuery({ query: query });
  // let [mutate] = useMutation(someMutation);
  // mutate({ variables: { arg: "" } });
  data.hello;
  data.other;
  data.aTh;
  // data.aThin;

  return "something";
};
