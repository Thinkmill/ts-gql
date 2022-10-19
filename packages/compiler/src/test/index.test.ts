import * as fs from "../fs";
import path from "path";
import fixturez from "fixturez";
import { parse } from "graphql";
import { getGeneratedTypes } from "../get-generated-types";
import { getConfig } from "@ts-gql/config";
import stripAnsi from "strip-ansi";
import slash from "slash";
import { schema } from "./test-schema";

let f = fixturez(__dirname);

async function setupEnv(specificSchema: string = schema) {
  let tempdir = f.temp();

  let promises = [];

  promises.push(
    fs.writeFile(
      path.join(tempdir, "package.json"),
      JSON.stringify(
        {
          name: "something",
          "ts-gql": {
            schema: "schema.graphql",
            scalars: { JSON: "MyGloballyDefinedJSONType" },
          },
        },
        null,
        2
      )
    )
  );
  promises.push(
    fs.writeFile(path.join(tempdir, "schema.graphql"), specificSchema)
  );
  await Promise.all(promises);
  return tempdir;
}

async function build(cwd: string) {
  let result = await getGeneratedTypes(await getConfig(cwd), true);
  return {
    errors: result.errors.map((x) =>
      stripAnsi(x.replace(slash(cwd), "CURRENT_WORKING_DIRECTORY"))
    ),
    fsOperations: result.fsOperations
      .filter((x) => !path.parse(x.filename).name.startsWith("@"))
      .sort((a, b) => a.filename.localeCompare(b.filename))
      .map((x) => ({ ...x, filename: slash(path.relative(cwd, x.filename)) })),
  };
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

  return `gql\`${strs[0]}\` as import("./__generated__/ts-gql/${first.name.value}");\n`;
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
  expect(await build(dir)).toMatchSnapshot();
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

  expect(await build(dir)).toMatchSnapshot();
});

test("something", async () => {
  let dir = await setupEnv(schema);
  await fs.writeFile(
    path.join(dir, "index.tsx"),
    makeSourceFile([
      graphql`
        fragment Frag_a on OutputThing {
          other
        }
      `,
      graphql`
        fragment Frag_b on OutputThing {
          arr {
            id
          }
        }
      `,
      graphql`
        query Thing {
          someObj {
            arr {
              ...Frag_a
            }
            ...Frag_b
          }
        }
      `,
    ])
  );
  expect(await build(dir)).toMatchSnapshot();
});

test("errors in fragments are not shown for usages", async () => {
  let dir = await setupEnv(schema);
  await fs.writeFile(
    path.join(dir, "index.tsx"),
    makeSourceFile([
      graphql`
        query Thing {
          someObj {
            ...Frag_a
          }
        }
      `,
      graphql`
        fragment Frag_a on OutputThing {
          othe
          ...Frag_b
        }
      `,
      graphql`
        fragment Frag_b on OutputThing {
          arr {
            i
          }
        }
      `,
    ])
  );
  expect((await build(dir)).errors).toMatchInlineSnapshot(`
    [
      "CURRENT_WORKING_DIRECTORY/index.tsx:12:11
      10 | gql\`
      11 |         fragment Frag_a on OutputThing {
    > 12 |           othe
         |           ^ Cannot query field "othe" on type "OutputThing". Did you mean "other"?
      13 |           ...Frag_b
      14 |         }
      15 |       \` as import("./__generated__/ts-gql/Frag_a");",
      "CURRENT_WORKING_DIRECTORY/index.tsx:20:13
      18 |         fragment Frag_b on OutputThing {
      19 |           arr {
    > 20 |             i
         |             ^ Cannot query field "i" on type "OutputThing". Did you mean "id"?
      21 |           }
      22 |         }
      23 |       \` as import("./__generated__/ts-gql/Frag_b");",
    ]
  `);
});

test("with directory that ends with .ts", async () => {
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
  const dirEndsWithTs = path.join(dir, "thing.ts");
  await fs.mkdir(dirEndsWithTs);

  await fs.writeFile(path.join(dirEndsWithTs, "thing.mp4"), ``);

  expect(await build(dir)).toMatchSnapshot();
});

test("optional variable", async () => {
  let dir = await setupEnv();

  await fs.writeFile(
    path.join(dir, "index.tsx"),
    makeSourceFile([
      graphql`
        query Thing($optional: String) {
          optional(thing: $optional)
        }
      `,
    ])
  );
  const dirEndsWithTs = path.join(dir, "thing.ts");
  await fs.mkdir(dirEndsWithTs);

  await fs.writeFile(path.join(dirEndsWithTs, "thing.mp4"), ``);

  expect(await build(dir)).toMatchSnapshot();
});

test("optional and required variables", async () => {
  let dir = await setupEnv();

  await fs.writeFile(
    path.join(dir, "index.tsx"),
    makeSourceFile([
      graphql`
        query Thing($optional: String, $required: String!) {
          optional(thing: $optional)
          other: optional(thing: $required)
        }
      `,
    ])
  );
  const dirEndsWithTs = path.join(dir, "thing.ts");
  await fs.mkdir(dirEndsWithTs);

  await fs.writeFile(path.join(dirEndsWithTs, "thing.mp4"), ``);

  expect(await build(dir)).toMatchSnapshot();
});

test("required variable", async () => {
  let dir = await setupEnv();

  await fs.writeFile(
    path.join(dir, "index.tsx"),
    makeSourceFile([
      graphql`
        query Thing($required: String!) {
          optional(thing: $required)
        }
      `,
    ])
  );
  const dirEndsWithTs = path.join(dir, "thing.ts");
  await fs.mkdir(dirEndsWithTs);

  await fs.writeFile(path.join(dirEndsWithTs, "thing.mp4"), ``);

  expect(await build(dir)).toMatchSnapshot();
});

test.skip("fragments with circular dependencies error well", async () => {
  let dir = await setupEnv();

  await fs.writeFile(
    path.join(dir, "index.tsx"),
    makeSourceFile([
      graphql`
        fragment Frag_a on OutputThing {
          ...Frag_b
          other
        }
      `,
      graphql`
        fragment Frag_b on OutputThing {
          ...Frag_a
          arr {
            id
          }
        }
      `,
      graphql`
        query Thing {
          someObj {
            ...Frag_b
          }
        }
      `,
    ])
  );
  const dirEndsWithTs = path.join(dir, "thing.ts");
  await fs.mkdir(dirEndsWithTs);

  await fs.writeFile(path.join(dirEndsWithTs, "thing.mp4"), ``);

  expect(await build(dir)).toMatchSnapshot();
});

test("returned nullable fields are not optional", async () => {
  let dir = await setupEnv();

  await fs.writeFile(
    path.join(dir, "index.tsx"),
    makeSourceFile([
      graphql`
        query Thing {
          something
        }
      `,
    ])
  );

  expect(await build(dir)).toMatchInlineSnapshot(`
    {
      "errors": [],
      "fsOperations": [
        {
          "content": "// ts-gql-integrity:6de535838f744a7359151432fde7329b
    /*
    ts-gql-meta-begin
    {
      "hash": "12c66fd54195642a9d34f679397ad42b"
    }
    ts-gql-meta-end
    */

    import * as SchemaTypes from "./@schema";
    import { TypedDocumentNode } from "@ts-gql/tag";

    type ThingQueryVariables = SchemaTypes.Exact<{ [key: string]: never; }>;


    type ThingQuery = { readonly __typename: 'Query', readonly something: string | null };



    export type type = TypedDocumentNode<{
      type: "query";
      result: ThingQuery;
      variables: {};
      documents: SchemaTypes.TSGQLDocuments;
      fragments: SchemaTypes.TSGQLRequiredFragments<"none">
    }>

    declare module "./@schema" {
      interface TSGQLDocuments {
        Thing: type;
      }
    }

    export const document = JSON.parse("{\\"kind\\":\\"Document\\",\\"definitions\\":[{\\"kind\\":\\"OperationDefinition\\",\\"operation\\":\\"query\\",\\"name\\":{\\"kind\\":\\"Name\\",\\"value\\":\\"Thing\\"},\\"variableDefinitions\\":[],\\"directives\\":[],\\"selectionSet\\":{\\"kind\\":\\"SelectionSet\\",\\"selections\\":[{\\"kind\\":\\"Field\\",\\"name\\":{\\"kind\\":\\"Name\\",\\"value\\":\\"something\\"},\\"arguments\\":[],\\"directives\\":[]}]}}]}")
    ",
          "filename": "__generated__/ts-gql/Thing.ts",
          "type": "output",
        },
      ],
    }
  `);
});

test("custom scalar types scalars are used", async () => {
  let dir = await setupEnv();

  await fs.writeFile(
    path.join(dir, "index.tsx"),
    makeSourceFile([
      graphql`
        query Thing {
          json
        }
      `,
    ])
  );

  expect(await build(dir)).toMatchInlineSnapshot(`
    {
      "errors": [],
      "fsOperations": [
        {
          "content": "// ts-gql-integrity:3baa546c1d2642d5e3b35fe60129e3ed
    /*
    ts-gql-meta-begin
    {
      "hash": "abe64f35652fe59d9da3a289032796e3"
    }
    ts-gql-meta-end
    */

    import * as SchemaTypes from "./@schema";
    import { TypedDocumentNode } from "@ts-gql/tag";

    type ThingQueryVariables = SchemaTypes.Exact<{ [key: string]: never; }>;


    type ThingQuery = { readonly __typename: 'Query', readonly json: MyGloballyDefinedJSONType | null };



    export type type = TypedDocumentNode<{
      type: "query";
      result: ThingQuery;
      variables: {};
      documents: SchemaTypes.TSGQLDocuments;
      fragments: SchemaTypes.TSGQLRequiredFragments<"none">
    }>

    declare module "./@schema" {
      interface TSGQLDocuments {
        Thing: type;
      }
    }

    export const document = JSON.parse("{\\"kind\\":\\"Document\\",\\"definitions\\":[{\\"kind\\":\\"OperationDefinition\\",\\"operation\\":\\"query\\",\\"name\\":{\\"kind\\":\\"Name\\",\\"value\\":\\"Thing\\"},\\"variableDefinitions\\":[],\\"directives\\":[],\\"selectionSet\\":{\\"kind\\":\\"SelectionSet\\",\\"selections\\":[{\\"kind\\":\\"Field\\",\\"name\\":{\\"kind\\":\\"Name\\",\\"value\\":\\"json\\"},\\"arguments\\":[],\\"directives\\":[]}]}}]}")
    ",
          "filename": "__generated__/ts-gql/Thing.ts",
          "type": "output",
        },
      ],
    }
  `);
});

test("schema", async () => {
  let dir = await setupEnv();
  const result = await getGeneratedTypes(await getConfig(dir), true);
  const schema = result.fsOperations.find((x) =>
    x.filename.endsWith("@schema.d.ts")
  );
  schema!.filename = "@schema.d.ts";
  expect(schema).toMatchInlineSnapshot(`
    {
      "content": "// ts-gql-integrity:1e5d977ea90a009690c0e82ce161b9a2
    /*
    ts-gql-meta-begin
    {
      "hash": "ef5c60e4b1bbd14924c21b1faad70082"
    }
    ts-gql-meta-end
    */
    /** @deprecated This should not be used outside of code generated by ts-gql */
    export type Maybe<T> = T | null;
    /** @deprecated This should not be used outside of code generated by ts-gql */
    export type InputMaybe<T> = Maybe<T>;
    /** @deprecated This should not be used outside of code generated by ts-gql */
    export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
    /** @deprecated This should not be used outside of code generated by ts-gql */
    export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
    /** @deprecated This should not be used outside of code generated by ts-gql */
    export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };

    /** @deprecated This should not be used outside of code generated by ts-gql */
    export type Scalars = {
      String: string;
      Int: number;
      Float: number;
      Boolean: boolean;
      ID: string;
      JSON: JSON;
    };

    export type JSON = MyGloballyDefinedJSONType;

    export type Something = {
      readonly yes?: boolean | null;
      readonly no: string;
    };

    type TSGQLMaybeArray<T> = ReadonlyArray<T> | T

    export {};
    export interface TSGQLDocuments extends Record<string, import('@ts-gql/tag').TypedDocumentNode<import('@ts-gql/tag').BaseDocumentTypes>> {}

    export type TSGQLRequiredFragments<T> = (providedFragments: T) => T;",
      "filename": "@schema.d.ts",
      "type": "output",
    }
  `);
});
