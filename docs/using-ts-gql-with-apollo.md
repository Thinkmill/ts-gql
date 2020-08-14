# Using ts-gql with @ts-gql/apollo

> This guide covers how to consume a GraphQL API in an app, not how to do the setup necessary for this to work.

## Fetching your first query

Let's start by building a page that fetches a list of posts with the title and the name of the author from an imaginary GraphQL API.

<details>

<summary>Example GraphQL schema used here</summary>

```graphql
type Query {
  posts: [Post!]!
}

type Post {
  title: String!
  author: Author!
}

type Author {
  name: String!
}
```

</details>

First, we'll define our query by importing `gql` from `@ts-gql/tag` and using it as a [tagged template literal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#Tagged_templates) with our query.

```jsx
import { gql } from "@ts-gql/tag";

const query = gql`
  query PostListPage {
    posts {
      title
      author {
        name
      }
    }
  }
`;
```

> Notice that we've named this query, you must uniquely name all of your GraphQL operations and fragments. For operations, they should refer to the component name. For fragments, they should be in the format of `ComponentName_propName`. For queries and mutations, having a perfect name is not super important. For fragments though, the naming is much more important because the name is relevant outside of the component itself.

When you save in your editor, `as import('../../__generated__/ts-gql/PostListPage').type` will be added after the template. We're not going to go into detail here about how this works here but what this does is encodes type information.

```jsx
import { gql } from '@ts-gql/tag';

const query = gql`
  query PostListPage {
    posts {
      title
      author {
        name
      }
    }
  }
` as import('../../__generated__/ts-gql/PostListPage').type;
```

> If `as import (...)` is not being added, make sure that there are no syntax errors in the file and you have ESLint auto-fix on save enabled in your editor

Before we continue, make sure that you have your dev server running(assuming that you've set up your dev server to start ts-gql's watcher, if you haven't run `ts-gql watch`). This is necessary so that the files which contain the type information can be generated.

Now we can use `useQuery` from `@ts-gql/apollo` to do the actual data fetching.

```tsx
import { gql } from "@ts-gql/tag";
import { useQuery } from "@ts-gql/apollo";

const query = gql`
  query PostListPage {
    posts {
      title
      author {
        name
      }
    }
  }
` as import("../../__generated__/ts-gql/PostListPage").type;

const PostListPage = () => {
  const { data, error } = useQuery(query);

  if (error) return <span>Error!</span>;
  if (!data) return <span>Loading...</span>;
};
```

We're first handling the loading and error states. An important thing to notice is that we're not using `loading` from `useQuery` to determine if we're in a loading state, we're using `!data` instead. This is for two reasons:

- TypeScript won't understand that the data will exist when you check loading(and TypeScript is correct! just because `loading` is `false`, that doesn't necessarily mean there is data, checking `data` actually ensures that data is there)
- When refetching, we'll show the stale data data and the stale data will be replaced with the fresh data when the refetch finishes so users can still see the

We're also checking `error` _before_ we check `data`. If we did it in the opposite order, the error state would never be shown and it would always look like it's in a loading state.

Now we can actually use the data

```tsx
import { gql } from "@ts-gql/tag";
import { useQuery } from "@ts-gql/apollo";

const query = gql`
  query PostListPage {
    posts {
      title
      author {
        name
      }
    }
  }
` as import("../../__generated__/ts-gql/PostListPage").type;

const PostListPage = () => {
  const { data, error } = useQuery(query);

  if (error) return <span>Error!</span>;
  if (!data) return <span>Loading...</span>;

  return (
    <ul>
      {data.posts.map((post) => {
        return (
          <li>
            {post.name} written by {post.author.name}
          </li>
        );
      })}
    </ul>
  );
};
```

## Fragments

### Building a component with a data dependency using fragments

Now let's imagine our post list does a bit more and we want to reuse it around our app. We're going to build a component for it and define it's data dependency with a fragment.

```tsx
import { gql } from "@ts-gql/tag";

const fragment = gql`
  fragment PostList_posts on Post {
    title
    author {
      name
    }
  }
` as import("../../__generated__/ts-gql/PostList_posts").type;
```

A fragment is just like a query except that rather than selecting fields on the query type, you're selecting fields on some arbitrary GraphQL type, in this case we're selecting fields on `Post`.

Note that we're calling the fragment `PostList_posts` because it will be for a component named `PostList` and the prop that the data should be passed to is `posts`.

Next, we'll want to define the props that our component accepts

```tsx
import { gql, FragmentData } from "@ts-gql/tag";

const fragment = gql`
  fragment PostList_posts on Post {
    title
    author {
      name
    }
  }
` as import("../../__generated__/ts-gql/PostList_posts").type;

type PostListProps = {
  posts: ReadonlyArray<FragmentData<typeof fragment>>;
};
```

There's quite a few TypeScript things going on here so let's go through them:

- `typeof fragment` get's the TypeScript type of the fragment variable. Note that `typeof` has a different meaning when used in _type position_ like it is here. Rather than returning `"object"` like `typeof fragment` would return at runtime, `typeof fragment` here refers to the TypeScript type of the variable.
- `FragmentData<...>` is a type that ts-gql exposes which get's the type for the result of a fragment
- `ReadonlyArray<...>` is type built-in to TypeScript which is just like an array except with the mutable methods of an array removed. Note that this doesn't do anything at runtime but TypeScript will enforce that the array isn't mutated. The reason that we're using `ReadonlyArray` here instead of `Array` is that the types that ts-gql generates are all readonly and we want consumers of our component. ts-gql generates readonly types because they're easier to use in certain cases because TypeScript can provide more guarantees for readonly values than mutable values.

Now that we've got our prop types, we can define our actual component.

```tsx
import { gql, FragmentData } from "@ts-gql/tag";

const fragment = gql`
  fragment PostList_posts on Post {
    title
    author {
      name
    }
  }
` as import("../../__generated__/ts-gql/PostList_posts").type;

type PostListProps = {
  posts: ReadonlyArray<FragmentData<typeof fragment>>;
};

export const PostList = (props: PostListProps) => {
  return (
    <ul>
      {props.posts.map((post) => {
        return (
          <li>
            {post.name} written by {post.author.name}
          </li>
        );
      })}
    </ul>
  );
};
```

### Using a component with a fragment

Now let's go back to our page component, and use our new component. We need to spread the fragment and then use our component and pass in the posts.

```tsx
import { gql } from "@ts-gql/tag";
import { useQuery } from "@ts-gql/apollo";
import { PostList } from "./PostList";

const query = gql`
  query PostListPage {
    posts {
      ...PostList_posts
    }
  }
` as import("../../__generated__/ts-gql/PostListPage").type;

const PostListPage = () => {
  const { data, error } = useQuery(query);

  if (error) return <span>Error!</span>;
  if (!data) return <span>Loading...</span>;

  return <PostList posts={data.posts} />;
};
```

> You might have noticed that we didn't need to import or interpolate the fragment in our query, we just spread it. You don't need to import the fragment because all the fragments in an app are available to be spread in any fragment or operation and at build time, the fragments that are used are added to the necessary operations/fragments so that Apollo can do the actual network request.

Using a fragment rather than making consumers of our `PostList` component fetch the necessary fields means that we can fetch more or fewer fields when the `PostList` needs to without having to worry about the consumers of it because they'll fetch whatever fields are specified by the fragment.
