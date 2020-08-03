export const gql = () => {
  if (process.env.NODE_ENV !== "production") {
    throw new Error(
      "Unexpected runtime `gql` call. `gql` from `@ts-gql/tag` should never be called at runtime. This is likely happening because:\n- You haven't included `@ts-gql/babel-plugin` in your Babel config\n- This call doesn't have `as import(...)` that should be added by `@ts-gql/eslint-plugin`"
    );
  } else {
    throw new Error("Unexpected runtime `gql` call.");
  }
};

export const getDocumentNode = (node) => node;
