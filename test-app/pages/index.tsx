import "@ts-gql/apollo";
import { gql } from "@ts-gql/tag";
import { useQuery } from "@apollo/client";

const query2 = gql`
  query MyOtherQuery {
    hello
    other
    another
    aTh: another
  }
`("MyOtherQuery");

type Thing = { thing?: { other: true }; other: boolean; another: {} };

type Exclude<T, U> = [T] extends [U] ? never : T;

type X = Exclude<any, undefined>;

// type Thing = Diff<undefined | string, undefined>;

type Other = {
  [Key in keyof Thing]: [Thing[Key]] extends [boolean] ? never : Thing[Key];
};

let query = gql`
  query SomeQuery($arg: String!) {
    optional(thing: $arg)
    ye: something
  }
`("SomeQuery");

export default () => {
  const { data } = useQuery(query, { variables: {} });
  data.hello;
  data.other;
  data.aThing;
  // data.aThin;

  return "something";
};
