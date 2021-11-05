import { gql } from "@ts-gql/tag/no-babel";
import { useMutation } from "@ts-gql/apollo";

const query2 = gql`
  query MyQueryApollo($x: Something!, $thng: String) {
    optional(thing: $thng)
    oneMore(other: $x)
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

gql`
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
    refetchQueries: ["SomeQueryApollo"],
  });
  // data.hello;
  // data.other;
  // data.aTh;
  // data.aThin;

  return "something";
};
