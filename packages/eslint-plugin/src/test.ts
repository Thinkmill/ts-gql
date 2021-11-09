import { SnapshotCreator } from "eslint-snapshot-test";
import { rules } from ".";
import { Config } from "@ts-gql/config";
import fs from "fs";
import { buildSchema } from "graphql";
import path from "path";
import { schema } from "../../compiler/src/test/test-schema";

let snapshotCreator = new SnapshotCreator({
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    ecmaFeatures: {
      jsx: true,
    },
    sourceType: "module",
  },
});

let builtSchema = buildSchema(schema);

let testConfig: Config = {
  addTypename: true,
  directory: __dirname,
  readonlyTypes: true,
  scalars: {},
  schemaHash: "123",
  schemaFilename: "schema.graphql",
  schema: () => builtSchema,
  mode: "transform",
};

let fixturesPath = path.join(__dirname, "__fixtures__");

let fixtures = fs.readdirSync(fixturesPath);

for (const fixture of fixtures) {
  test(fixture, async () => {
    const fixturePath = path.join(fixturesPath, fixture);
    const code = fs.readFileSync(fixturePath, "utf8");
    let result = snapshotCreator
      .mark({
        code,
        rule: rules["ts-gql"],
        ruleName: "ts-gql",
      })
      .withFileName(fixturePath)
      .withOptions([
        {
          ...testConfig,
          mode: fixture.endsWith(".no-transform.ts")
            ? "no-transform"
            : fixture.endsWith(".mixed.ts")
            ? "mixed"
            : "transform",
        },
      ])
      .render();
    if (result.fixedOutput === code) {
      delete result.fixedOutput;
    }
    expect(result).toMatchSnapshot();
  });
}
