import { useQuery } from "@ts-gql/apollo";
import { gql } from "@ts-gql/tag/no-transform";
import { ApolloClient, InMemoryCache } from "@apollo/client";
import { useMemo } from "react";

const postListFragment = gql`
  fragment PostList_posts on Post {
    title
    author {
      name
    }
  }
` as import("../../__generated__/ts-gql/PostList_posts").type;

const _authorListFragment = gql`
  fragment AuthorList_author on Author {
    name
  }
` as import("../../__generated__/ts-gql/AuthorList_author").type;

const query = gql`
  query PostListPage {
    posts {
      title
      ...PostList_posts
    }
  }
  ${postListFragment}
` as import("../../__generated__/ts-gql/PostListPage").type;

export default function Test() {
  const client = useMemo(() => {
    return new ApolloClient({
      uri: "http://localhost:3000/api/graphql",
      cache: new InMemoryCache(),
    });
  }, []);
  const { loading, data, error } = useQuery(query, { client });
  return <pre>{JSON.stringify({ loading, data, error }, null, 2)}</pre>;
}
