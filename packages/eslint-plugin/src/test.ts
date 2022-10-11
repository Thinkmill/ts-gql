import { SnapshotCreator } from "eslint-snapshot-test";
import { rules } from ".";
import { Config } from "@ts-gql/config";
import fs from "fs";
import { buildSchema } from "graphql";
import path from "path";
import { directory } from "tempy";
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

test("config and file in the same directory", () =>
  directory.task(async (tmpPath) => {
    const filePath = path.join(tmpPath, "test.ts");
    fs.writeFileSync(
      `${tmpPath}/package.json`,
      JSON.stringify({
        name: "blah",
        "ts-gql": {
          schema: "schema.graphql",
        },
      })
    );
    fs.writeFileSync(`${tmpPath}/schema.graphql`, schema);

    const code = `
    import { gql } from "@ts-gql/tag";
    gql\`
      query Something {
        hello
      }
    \`;
    `;
    fs.writeFileSync(filePath, code);
    let result = snapshotCreator
      .mark({
        code,
        rule: rules["ts-gql"],
        ruleName: "ts-gql",
      })
      .withFileName(filePath)
      .render();
    expect(result).toMatchInlineSnapshot(`
      {
        "fixedOutput": "
          import { gql } from "@ts-gql/tag";
          gql\`
            query Something {
              hello
            }
          \`as import("./__generated__/ts-gql/Something").type;
          ",
        "lintMessages": [
          {
            "column": 5,
            "endColumn": 6,
            "endLine": 7,
            "fix": {
              "range": [
                100,
                100,
              ],
              "text": "as import("./__generated__/ts-gql/Something").type",
            },
            "line": 3,
            "message": "You must cast gql tags with the generated type",
            "messageId": "mustUseAs",
            "nodeType": "TaggedTemplateExpression",
            "ruleId": "ts-gql",
            "severity": 2,
          },
        ],
        "snapshot": "

          import { gql } from "@ts-gql/tag";
          gql\`
          ~~~~    [You must cast gql tags with the generated type]
            query Something {
      ~~~~~~~~~~~~~~~~~~~~~~~    [You must cast gql tags with the generated type]
              hello
      ~~~~~~~~~~~~~    [You must cast gql tags with the generated type]
            }
      ~~~~~~~    [You must cast gql tags with the generated type]
          \`;
      ~~~~~    [You must cast gql tags with the generated type]
          ",
      }
    `);
  }));
