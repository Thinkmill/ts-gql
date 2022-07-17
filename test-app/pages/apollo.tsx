import { gql } from "@ts-gql/tag/no-transform";
import { createFetcher } from "@ts-gql/fetch";
import * as urql from "urql";
import * as apollo from "@apollo/client";

const query2 = gql`
  query MyQueryApollo($thing: String) {
    optional(thing: $thing)
  }
` as import("../__generated__/ts-gql/MyQueryApollo").type;

const someFragment = gql`
  fragment Something2Apollo_x on Query {
    hello
    someObj {
      id
      other
    }
    arr {
      id
      other
    }
    thing {
      id
      ... on ImplementationOfThing {
        something
      }
    }
  }
` as import("../__generated__/ts-gql/Something2Apollo_x").type;

const otherFragment = gql`
  fragment OtherFragment_x on Query {
    hello
    someObj {
      id
      other
    }
    arr {
      id
      other
    }
    thing {
      id
      ... on ImplementationOfThing {
        something
      }
    }
  }
` as import("../__generated__/ts-gql/OtherFragment_x").type;

const query = gql`
  query SomeQueryApollo($arg: String!) {
    optional(thing: $arg)
    ye: something

    ...Something2Apollo_x
  }
  ${someFragment}
` as import("../__generated__/ts-gql/SomeQueryApollo").type;

let someMutation = gql`
  mutation SomeMutationApollo($arg: String!) {
    optional(thing: $arg)
    ye: something
  }
` as import("../__generated__/ts-gql/SomeMutationApollo").type;

console.log({ query, someMutation });

const fetchGraphQL = createFetcher("");

fetchGraphQL(someMutation, { arg: "" });
fetchGraphQL(query2);

export default () => {
  // let client = useApolloClient();
  // const { data } = useQuery(query, { variables: { arg: "" } });
  // <MyComp query={data} />;
  // data.hello;
  // data.another;
  const [stuff, mutate] = urql.useMutation(someMutation);
  mutate();
  mutate({
    arg: "",
  }).then((x) => {
    x.data?.__typename;
  });

  stuff.data?.__typename;

  const [apolloMutate, apolloStuff] = apollo.useMutation(someMutation, {
    variables: {
      arg: "",
    },
  });
  apolloStuff.data?.optional;

  apolloMutate({
    variables: {
      arg,
    },
  });

  // data.hello;
  // data.other;
  // data.aTh;
  // data.aThin;

  return "something";
};
