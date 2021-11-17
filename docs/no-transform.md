# Using ts-gql without the Babel plugin

If you want to use ts-gql without the Babel plugin, it is largely the same as using ts-gql with the Babel plugin except that when you use a fragment, you need to interpolate the fragment as well. Note that the same constraints as using ts-gql normally still apply like fragments/operations having unique names.

First, you need to set the `mode` in your `ts-gql` config to `"no-transform"`.

```json
"ts-gql": {
  "schema": "schema.graphql",
  "mode": "no-transform"
}
```

You can also set the mode to `"mixed"` to [migrate incrementally](#migrating).

A query with no fragments works the same as when using the Babel plugin except that you import from `@ts-gql/tag/no-transform` rather than `@ts-gql/tag`. You write the query as you did before.

```tsx
import { gql } from "@ts-gql/tag/no-transform";

gql`
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

And the ESLint plugin will add the cast as

```tsx
import { gql } from "@ts-gql/tag/no-transform";

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
```

When you want to write a fragment that doesn't itself use fragments, that works the same as before but with the import changed.

```tsx
import { gql } from "@ts-gql/tag/no-transform";

const fragment = gql`
  fragment PostList_posts on Post {
    title
    author {
      name
    }
  }
` as import("../../__generated__/ts-gql/PostList_posts").type;
```

The difference comes in when you want to use a fragment. In the new mode, when you use a fragment like this

```tsx
import { gql } from "@ts-gql/tag/no-transform";

const query = gql`
  query PostListPage {
    posts {
      ...PostList_posts
    }
  }
` as import("../../__generated__/ts-gql/PostListPage").type;
```

If you have ESLint and TypeScript setup in your editor, you'll probably see something like this:

```
When using @ts-gql/tag/no-runtime, all of the fragments that are used must be interpolated, 1 fragment is used but 0 fragments are interpolated eslint(@ts-gql/ts-gql)

Conversion of type 'TypedDocumentNodeToBeCast<never>' to type 'TypedDocumentNode<{ type: "query"; result: PostListPageQuery; variables: Exact<{ [key: string]: never; }>; documents: TSGQLDocuments; fragments: TSGQLRequiredFragments<{ PostList_posts: true; }>; }>' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  The types of '___type.fragments' are incompatible between these types.
    Type 'ProvidedFragments<"none">' is not comparable to type 'TSGQLRequiredFragments<{ PostList_posts: true; }>'.
      Types of parameters 'requiredFragments' and 'providedFragments' are incompatible.
        Type '{ PostList_posts: true; }' is not comparable to type '"none"'. ts(2352)
```

The ESLint error tells you what to do here, you need to interpolate the fragment in the `gql` call.

```tsx
import { gql } from "@ts-gql/tag/no-transform";

const fragment = gql`
  fragment PostList_posts on Post {
    title
    author {
      name
    }
  }
` as import("../../__generated__/ts-gql/PostList_posts").type;

const query = gql`
  query PostListPage {
    posts {
      ...PostList_posts
    }
  }
  ${fragment}
` as import("../../__generated__/ts-gql/PostListPage").type;
```

You can pretty much ignore that TypeScript error in general and just look at the ESLint rule error to see what to do. If you interpolate the _wrong fragment_ but the _right number of fragments_ though then you'll only get that TypeScript error because the ESLint rule doesn't know what you've actually interpolated but TypeScript does.

<details><summary>Doesn't typescript-eslint allow ESLint rules to use type information?</summary>

Yes! You're correct, it does. It comes with a cost though, it slows down linting performance. Given that interpolating the wrong fragment should be reasonably rare and once you know what to look for, understanding the error is reasonable, ts-gql has opted not to depend on type information in the ESLint rule.

</details>

For example, let's say we had this.

```tsx
import { gql } from "@ts-gql/tag/no-transform";

const postListFragment = gql`
  fragment PostList_posts on Post {
    title
    author {
      name
    }
  }
` as import("../../__generated__/ts-gql/PostList_posts").type;

const authorListFragment = gql`
  fragment AuthorList_author on Author {
    name
  }
` as import("../../__generated__/ts-gql/AuthorList_author").type;

const query = gql`
  query PostListPage {
    posts {
      ...PostList_posts
    }
  }
  ${authorListFragment}
` as import("../../__generated__/ts-gql/PostListPage").type;
```

We'll get an error that looks like this:

```
Conversion of type 'TypedDocumentNodeToBeCast<"AuthorList_author">' to type 'TypedDocumentNode<{ type: "query"; result: PostListPageQuery; variables: Exact<{ [key: string]: never; }>; documents: TSGQLDocuments; fragments: TSGQLRequiredFragments<{ PostList_posts: true; }>; }>' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  The types of '___type.fragments' are incompatible between these types.
    Type 'ProvidedFragments<{ AuthorList_author: true; }>' is not comparable to type 'TSGQLRequiredFragments<{ PostList_posts: true; }>'.
      Types of parameters 'requiredFragments' and 'providedFragments' are incompatible.
        Property 'AuthorList_author' is missing in type '{ PostList_posts: true; }' but required in type '{ AuthorList_author: true; }'. ts(2352)
```

Most of this isn't interesting and it's important to note that `If this was intentional, convert the expression to 'unknown' first.` doesn't apply here, you shouldn't cast the call to `unknown`. The part that you should focus on is at the bottom:

```
      Types of parameters 'requiredFragments' and 'providedFragments' are incompatible.
        Property 'AuthorList_author' is missing in type '{ PostList_posts: true; }' but required in type '{ AuthorList_author: true; }'. ts(2352)
```

This is indicating that we need to interpolate the fragment with the name `AuthorList_author` but we're currently interpolating a fragment with the name `PostList_posts`. So when we interpolate the right fragment, the error will go away.

```tsx
import { gql } from "@ts-gql/tag/no-transform";

const postListFragment = gql`
  fragment PostList_posts on Post {
    title
    author {
      name
    }
  }
` as import("../../__generated__/ts-gql/PostList_posts").type;

const authorListFragment = gql`
  fragment AuthorList_author on Author {
    name
  }
` as import("../../__generated__/ts-gql/AuthorList_author").type;

const query = gql`
  query PostListPage {
    posts {
      ...PostList_posts
    }
  }
  ${postListFragment}
` as import("../../__generated__/ts-gql/PostListPage").type;
```

## Migrating

To ease with migrating, you can set the mode to `"mixed"` instead of `"no-transform"`, this will allow importing from both `@ts-gql/tag` and `@ts-gql/tag/no-transform`. Note when using `"mixed"`, you still need to use the Babel plugin. When you're done migrating, you can change the mode to`"no-transform"` and you won't need to use the Babel plugin.

```json
"ts-gql": {
  "schema": "schema.graphql",
  "mode": "mixed"
}
```
