let gql = ([str]: TemplateStringsArray) => str;

export let schema = gql`
  type Query {
    hello: String!
    other: Boolean!
    another: String!
    something: String
    someObj: OutputThing!
    arr: [OutputThing!]!
    node: Node!
    optional(thing: String): String!
    oneMore(thing: String, other: Something!): String!
    union: [Union]!
    json(json: JSON): JSON
    enum(a: SomeEnum): SomeEnum
  }

  enum SomeEnum {
    a
    b
  }

  scalar JSON

  type Mutation {
    hello: String!
    other: Boolean!
    another: String!
    something: String
    optional(thing: String): String!
    oneMore(thing: String, other: Something!): String!
  }

  interface Node {
    id: ID!
  }

  type SomethingNode implements Node {
    id: ID!
    something: String!
  }

  type AnotherNode implements Node {
    id: ID!
    another: String!
  }

  type OutputThing {
    id: ID!
    other: String!
    arr: [OutputThing!]!
  }

  input Something {
    yes: Boolean
    no: String!
  }

  union Union = A | B

  type A {
    a: String
  }

  type B {
    b: String
  }
`;
