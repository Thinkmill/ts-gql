module.exports = {
  plugins: ["@ts-gql"],
  parser: "@typescript-eslint/parser",
  rules: {
    "@ts-gql/ts-gql": [
      "error",
      {
        schemaFilename: require("path").join(__dirname, "schema.graphql"),
        generatedDirectory: require("path").join(
          __dirname,
          "__generated__",
          "ts-gql"
        ),
      },
    ],
  },
};
