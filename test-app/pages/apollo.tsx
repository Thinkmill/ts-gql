import { gql } from "@ts-gql/tag";
import { useQuery, useMutation } from "@ts-gql/apollo";

const query2 = gql`
  query MyQueryApollo {
    hello
    another
  }
` as import("../__generated__/ts-gql/MyQueryApollo").type;

const someFragment = gql`
  fragment Something2Apollo_x on Query {
    hello
  }
` as import("../__generated__/ts-gql/Something2Apollo_x").type;

let query = gql`
  query SomeQueryApollo($arg: String!) {
    optional(thing: $arg)
    ye: something

    ...Something2Apollo_x
  }
` as import("../__generated__/ts-gql/SomeQueryApollo").type;

let someMutation = gql`
  mutation SomeMutationApollo($arg: String!) {
    optional(thing: $arg)
    ye: something
  }
` as import("../__generated__/ts-gql/SomeMutationApollo").type;

console.log({ query, someMutation });

export default () => {
  // let client = useApolloClient();
  // const { data } = useQuery(query, { variables: { arg: "" } });
  // <MyComp query={data} />;
  // data.hello;
  // data.another;
  let [mutate] = useMutation(someMutation);
  mutate({
    variables: { arg: "" },
    refetchQueries: ["MyQueryUrql", "SomeQueryApollo"],
  });
  // data.hello;
  // data.other;
  // data.aTh;
  // data.aThin;

  return "something";
};
