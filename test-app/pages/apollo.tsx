import "@ts-gql/apollo";
import { gql, DocumentResult } from "@ts-gql/tag";
import { useQuery, useApolloClient } from "@apollo/client";

const query2 = gql`
  query MyQueryApollo {
    hello
    another
  }
` as import("../__generated__/ts-gql/MyQueryApollo").type;

const someFragment = gql`
  fragment Something2Apollo on Query {
    hello
  }
` as import("../__generated__/ts-gql/Something2Apollo").type;

function MyComp({ query }: { query: DocumentResult<typeof someFragment> }) {
  return null;
}

let query = gql`
  query SomeQueryApollo($arg: String!) {
    optional(thing: $arg)
    ye: something

    ...Something2Apollo
  }
` as import("../__generated__/ts-gql/SomeQueryApollo").type;

console.log(query);

let someMutation = gql`
  mutation SomeMutationApollo($arg: String!) {
    optional(thing: $arg)
    ye: something
  }
` as import("../__generated__/ts-gql/SomeMutationApollo").type;

export default () => {
  let client = useApolloClient();
  const { data } = useQuery(query, { variables: { arg: "" } });
  <MyComp query={data} />;
  data.hello;
  // data.another;
  // let [mutate] = useMutation(someMutation);
  // mutate({ variables: { arg: "" } });
  data.hello;
  // data.other;
  // data.aTh;
  // data.aThin;

  return "something";
};
