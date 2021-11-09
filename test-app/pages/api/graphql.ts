import { ApolloServer } from "apollo-server-micro";
// @ts-ignore
import typeDefs from "raw-loader!../../schema.graphql";

const resolvers = {
  Query: {
    hello: () => "Hello!",
    posts: () => [{ title: "blah", author: { name: "blah" } }],
  },
};

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default apolloServer.createHandler({
  path: "/api/graphql",
});
