import fs from "fs-extra";
import path from "path";
import fixturez from "fixturez";
import { parse } from "graphql";
import { getGeneratedTypes } from "./get-generated-types";
import { getConfig } from "@ts-gql/config";

let f = fixturez(__dirname);

async function build(cwd: string) {
  return getGeneratedTypes(await getConfig(cwd));
}

let gql = ([str]: TemplateStringsArray) => str;

let schema = gql`
  type Query {
    hello: String!
    other: Boolean!
    another: String!
    something: String
    someObj: OutputThing!
    arr: [OutputThing!]!
    thing: Thing!
    optional(thing: String): String!
    oneMore(thing: String, other: Something!): String!
  }

  type Mutation {
    hello: String!
    other: Boolean!
    another: String!
    something: String
    optional(thing: String): String!
    oneMore(thing: String, other: Something!): String!
  }

  interface Thing {
    id: ID!
  }

  type ImplementationOfThing implements Thing {
    id: ID!
    something: String!
  }

  type OutputThing {
    id: ID!
    other: String!
  }

  input Something {
    yes: Boolean
    no: String!
  }
`;

async function setupEnv() {
  let tempdir = f.temp();

  let promises = [];

  promises.push(
    fs.writeFile(
      path.join(tempdir, "package.json"),
      JSON.stringify(
        {
          name: "something",
          "ts-gql": { schema: "schema.graphql" },
        },
        null,
        2
      )
    )
  );
  promises.push(fs.writeFile(path.join(tempdir, "schema.graphql"), schema));
  await Promise.all(promises);
  return tempdir;
}

async function buildAndSnapshot(tempdir: string) {
  let result = await build(tempdir);
  expect({
    errors: result.errors,
    fsOperations: result.fsOperations
      .filter((x) => !path.parse(x.filename).name.startsWith("@"))
      .map((x) => ({ ...x, filename: path.relative(tempdir, x.filename) })),
  }).toMatchSnapshot();
}

function graphql(strs: TemplateStringsArray) {
  let first = parse(strs[0]).definitions[0];
  if (
    first.kind !== "FragmentDefinition" &&
    first.kind !== "OperationDefinition"
  ) {
    throw new Error(
      `First definition is a ${first.kind}, it must be a FragmentDefinition or OperationDefinition`
    );
  }
  if (!first.name) {
    throw new Error("First definition must have a name but it does not");
  }

  return `gql\`${strs[0]}\` as import("./__generated__/ts-gql/${first.name.value}")`;
}

function makeSourceFile(items: string[]) {
  return "import { gql } from '@ts-gql/tag';\n" + items.join("\n");
}

test("basic", async () => {
  let dir = await setupEnv();

  await fs.writeFile(
    path.join(dir, "index.tsx"),
    makeSourceFile([
      graphql`
        query Thing {
          hello
        }
      `,
    ])
  );
  await buildAndSnapshot(dir);
});

test("list with fragment works as expected", async () => {
  let dir = await setupEnv();

  await fs.writeFile(
    path.join(dir, "index.tsx"),
    makeSourceFile([
      graphql`
        query Thing {
          ...Frag_a
          ...Frag_b
        }
      `,
      graphql`
        fragment Frag_a on Query {
          arr {
            id
          }
        }
      `,
      graphql`
        fragment Frag_b on Query {
          arr {
            other
          }
        }
      `,
    ])
  );

  await buildAndSnapshot(dir);
});
