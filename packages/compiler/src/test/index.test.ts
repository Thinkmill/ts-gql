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
          json
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
          "content": "// ts-gql-integrity:a1d7fcfaec67f151f5c6515eefd74fb9
    /*
    ts-gql-meta-begin
    {
      "hash": "ac9af659262975d0b7178b6b3fa89c54"
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
          "content": "// ts-gql-integrity:a8adb2cc1a751f5fb1e62e80737a8943
    /*
    ts-gql-meta-begin
    {
      "hash": "c154f4080a06868e3d012e4587502116"
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
      "content": "// ts-gql-integrity:f31465ae62ea6baa80923fd8e4c0edf3
    /*
    ts-gql-meta-begin
    {
      "hash": "4e658dccccf6f11877e50bc829626b6d"
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

    export type Query = {
      readonly __typename: "Query";
      readonly hello: string;
      readonly other: boolean;
      readonly another: string;
      readonly something: string | null;
      readonly someObj: OutputThing;
      readonly arr: ReadonlyArray<OutputThing>;
      readonly node: Node;
      readonly optional: string;
      readonly oneMore: string;
      readonly union: ReadonlyArray<Union | null>;
      readonly json: JSON | null;
      readonly enum: SomeEnum | null;
      readonly inputObject: string | null;
    };

    export type QueryoptionalArgs = {
      readonly thing?: string | null;
    };

    export type QueryoneMoreArgs = {
      readonly thing?: string | null;
      readonly other: Something;
    };

    export type QueryjsonArgs = {
      readonly json?: JSON | null;
    };

    export type QueryenumArgs = {
      readonly a?: SomeEnum | null;
    };

    export type QueryinputObjectArgs = {
      readonly a?: SomeOneOf | null;
      readonly b?: OneOfWithOnlyOne | null;
    };

    export type SomeOneOf = {
      readonly a: string;
    } | {
      readonly b: number;
    } | {
      readonly c: boolean;
    };

    export type OneOfWithOnlyOne = {
      readonly a: string;
    };

    export type SomeEnum =
      | "a"
      | "b";

    export type JSON = MyGloballyDefinedJSONType;

    export type Mutation = {
      readonly __typename: "Mutation";
      readonly hello: string;
      readonly other: boolean;
      readonly another: string;
      readonly something: string | null;
      readonly optional: string;
      readonly oneMore: string;
    };

    export type MutationoptionalArgs = {
      readonly thing?: string | null;
    };

    export type MutationoneMoreArgs = {
      readonly thing?: string | null;
      readonly other: Something;
    };

    export type Node = {
      readonly id: string;
    };

    export type SomethingNode = {
      readonly __typename: "SomethingNode";
      readonly id: string;
      readonly something: string;
    };

    export type AnotherNode = {
      readonly __typename: "AnotherNode";
      readonly id: string;
      readonly another: string;
    };

    export type OutputThing = {
      readonly __typename: "OutputThing";
      readonly id: string;
      readonly other: string;
      readonly arr: ReadonlyArray<OutputThing>;
    };

    export type Something = {
      readonly yes?: boolean | null;
      readonly no: string;
    };

    export type Union = A | B;

    export type A = {
      readonly __typename: "A";
      readonly a: string | null;
    };

    export type B = {
      readonly __typename: "B";
      readonly b: string | null;
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

test("same fragment used twice", async () => {
  let dir = await setupEnv();

  await fs.writeFile(
    path.join(dir, "index.tsx"),
    makeSourceFile([
      graphql`
        fragment Thing_a on Query {
          hello
        }
      `,
      graphql`
        fragment Thing_b on Query {
          ...Thing_a
        }
      `,
      graphql`
        fragment Thing_c on Query {
          ...Thing_a
          other
        }
      `,
      graphql`
        query Thing {
          ...Thing_b
          ...Thing_c
        }
      `,
    ])
  );
  expect(await build(dir)).toMatchInlineSnapshot(`
    {
      "errors": [],
      "fsOperations": [
        {
          "content": "// ts-gql-integrity:e061b537ce4ec6ab7e02c1dc9f2b7a14
    /*
    ts-gql-meta-begin
    {
      "hash": "2aec65ca2024f5a992b96e9c088f531d"
    }
    ts-gql-meta-end
    */

    import * as SchemaTypes from "./@schema";
    import { TypedDocumentNode } from "@ts-gql/tag";

    type Thing_aFragment = { readonly __typename: 'Query', readonly hello: string };



    export type type = TypedDocumentNode<{
      type: "fragment";
      result: Thing_aFragment;
      name: "Thing_a";
      documents: SchemaTypes.TSGQLDocuments;
      fragments: SchemaTypes.TSGQLRequiredFragments<"none">
    }>

    declare module "./@schema" {
      interface TSGQLDocuments {
        Thing_a: type;
      }
    }

    export const document = JSON.parse("{\\"kind\\":\\"Document\\",\\"definitions\\":[{\\"kind\\":\\"FragmentDefinition\\",\\"name\\":{\\"kind\\":\\"Name\\",\\"value\\":\\"Thing_a\\"},\\"typeCondition\\":{\\"kind\\":\\"NamedType\\",\\"name\\":{\\"kind\\":\\"Name\\",\\"value\\":\\"Query\\"}},\\"directives\\":[],\\"selectionSet\\":{\\"kind\\":\\"SelectionSet\\",\\"selections\\":[{\\"kind\\":\\"Field\\",\\"name\\":{\\"kind\\":\\"Name\\",\\"value\\":\\"hello\\"},\\"arguments\\":[],\\"directives\\":[]}]}}]}")
    ",
          "filename": "__generated__/ts-gql/Thing_a.ts",
          "type": "output",
        },
        {
          "content": "// ts-gql-integrity:7faffe66f1ea1426680b19eef89b0a94
    /*
    ts-gql-meta-begin
    {
      "hash": "0d753e347786649d0a095a59168e75aa"
    }
    ts-gql-meta-end
    */

    import * as SchemaTypes from "./@schema";
    import { TypedDocumentNode } from "@ts-gql/tag";

    type Thing_bFragment = { readonly __typename: 'Query', readonly hello: string };



    export type type = TypedDocumentNode<{
      type: "fragment";
      result: Thing_bFragment;
      name: "Thing_b";
      documents: SchemaTypes.TSGQLDocuments;
      fragments: SchemaTypes.TSGQLRequiredFragments<{"Thing_a":true}>
    }>

    declare module "./@schema" {
      interface TSGQLDocuments {
        Thing_b: type;
      }
    }

    export const document = JSON.parse("{\\"kind\\":\\"Document\\",\\"definitions\\":[{\\"kind\\":\\"FragmentDefinition\\",\\"name\\":{\\"kind\\":\\"Name\\",\\"value\\":\\"Thing_b\\"},\\"typeCondition\\":{\\"kind\\":\\"NamedType\\",\\"name\\":{\\"kind\\":\\"Name\\",\\"value\\":\\"Query\\"}},\\"directives\\":[],\\"selectionSet\\":{\\"kind\\":\\"SelectionSet\\",\\"selections\\":[{\\"kind\\":\\"FragmentSpread\\",\\"name\\":{\\"kind\\":\\"Name\\",\\"value\\":\\"Thing_a\\"},\\"directives\\":[]}]}},{\\"kind\\":\\"FragmentDefinition\\",\\"name\\":{\\"kind\\":\\"Name\\",\\"value\\":\\"Thing_a\\"},\\"typeCondition\\":{\\"kind\\":\\"NamedType\\",\\"name\\":{\\"kind\\":\\"Name\\",\\"value\\":\\"Query\\"}},\\"directives\\":[],\\"selectionSet\\":{\\"kind\\":\\"SelectionSet\\",\\"selections\\":[{\\"kind\\":\\"Field\\",\\"name\\":{\\"kind\\":\\"Name\\",\\"value\\":\\"hello\\"},\\"arguments\\":[],\\"directives\\":[]}]}}]}")
    ",
          "filename": "__generated__/ts-gql/Thing_b.ts",
          "type": "output",
        },
        {
          "content": "// ts-gql-integrity:42260d782978d9ac63885da552cd7762
    /*
    ts-gql-meta-begin
    {
      "hash": "fa10b58f5385332208405ca427c5e37a"
    }
    ts-gql-meta-end
    */

    import * as SchemaTypes from "./@schema";
    import { TypedDocumentNode } from "@ts-gql/tag";

    type Thing_cFragment = { readonly __typename: 'Query', readonly other: boolean, readonly hello: string };



    export type type = TypedDocumentNode<{
      type: "fragment";
      result: Thing_cFragment;
      name: "Thing_c";
      documents: SchemaTypes.TSGQLDocuments;
      fragments: SchemaTypes.TSGQLRequiredFragments<{"Thing_a":true}>
    }>

    declare module "./@schema" {
      interface TSGQLDocuments {
        Thing_c: type;
      }
    }

    export const document = JSON.parse("{\\"kind\\":\\"Document\\",\\"definitions\\":[{\\"kind\\":\\"FragmentDefinition\\",\\"name\\":{\\"kind\\":\\"Name\\",\\"value\\":\\"Thing_c\\"},\\"typeCondition\\":{\\"kind\\":\\"NamedType\\",\\"name\\":{\\"kind\\":\\"Name\\",\\"value\\":\\"Query\\"}},\\"directives\\":[],\\"selectionSet\\":{\\"kind\\":\\"SelectionSet\\",\\"selections\\":[{\\"kind\\":\\"FragmentSpread\\",\\"name\\":{\\"kind\\":\\"Name\\",\\"value\\":\\"Thing_a\\"},\\"directives\\":[]},{\\"kind\\":\\"Field\\",\\"name\\":{\\"kind\\":\\"Name\\",\\"value\\":\\"other\\"},\\"arguments\\":[],\\"directives\\":[]}]}},{\\"kind\\":\\"FragmentDefinition\\",\\"name\\":{\\"kind\\":\\"Name\\",\\"value\\":\\"Thing_a\\"},\\"typeCondition\\":{\\"kind\\":\\"NamedType\\",\\"name\\":{\\"kind\\":\\"Name\\",\\"value\\":\\"Query\\"}},\\"directives\\":[],\\"selectionSet\\":{\\"kind\\":\\"SelectionSet\\",\\"selections\\":[{\\"kind\\":\\"Field\\",\\"name\\":{\\"kind\\":\\"Name\\",\\"value\\":\\"hello\\"},\\"arguments\\":[],\\"directives\\":[]}]}}]}")
    ",
          "filename": "__generated__/ts-gql/Thing_c.ts",
          "type": "output",
        },
        {
          "content": "// ts-gql-integrity:8b48ebbff14eeceb2fb47ee5ef77e678
    /*
    ts-gql-meta-begin
    {
      "hash": "40533504e18ab2909461c413f2778fb0"
    }
    ts-gql-meta-end
    */

    import * as SchemaTypes from "./@schema";
    import { TypedDocumentNode } from "@ts-gql/tag";

    type ThingQueryVariables = SchemaTypes.Exact<{ [key: string]: never; }>;


    type ThingQuery = { readonly __typename: 'Query', readonly hello: string, readonly other: boolean };



    export type type = TypedDocumentNode<{
      type: "query";
      result: ThingQuery;
      variables: {};
      documents: SchemaTypes.TSGQLDocuments;
      fragments: SchemaTypes.TSGQLRequiredFragments<{"Thing_b":true,"Thing_c":true}>
    }>

    declare module "./@schema" {
      interface TSGQLDocuments {
        Thing: type;
      }
    }

    export const document = JSON.parse("{\\"kind\\":\\"Document\\",\\"definitions\\":[{\\"kind\\":\\"OperationDefinition\\",\\"operation\\":\\"query\\",\\"name\\":{\\"kind\\":\\"Name\\",\\"value\\":\\"Thing\\"},\\"variableDefinitions\\":[],\\"directives\\":[],\\"selectionSet\\":{\\"kind\\":\\"SelectionSet\\",\\"selections\\":[{\\"kind\\":\\"FragmentSpread\\",\\"name\\":{\\"kind\\":\\"Name\\",\\"value\\":\\"Thing_b\\"},\\"directives\\":[]},{\\"kind\\":\\"FragmentSpread\\",\\"name\\":{\\"kind\\":\\"Name\\",\\"value\\":\\"Thing_c\\"},\\"directives\\":[]}]}},{\\"kind\\":\\"FragmentDefinition\\",\\"name\\":{\\"kind\\":\\"Name\\",\\"value\\":\\"Thing_b\\"},\\"typeCondition\\":{\\"kind\\":\\"NamedType\\",\\"name\\":{\\"kind\\":\\"Name\\",\\"value\\":\\"Query\\"}},\\"directives\\":[],\\"selectionSet\\":{\\"kind\\":\\"SelectionSet\\",\\"selections\\":[{\\"kind\\":\\"FragmentSpread\\",\\"name\\":{\\"kind\\":\\"Name\\",\\"value\\":\\"Thing_a\\"},\\"directives\\":[]}]}},{\\"kind\\":\\"FragmentDefinition\\",\\"name\\":{\\"kind\\":\\"Name\\",\\"value\\":\\"Thing_a\\"},\\"typeCondition\\":{\\"kind\\":\\"NamedType\\",\\"name\\":{\\"kind\\":\\"Name\\",\\"value\\":\\"Query\\"}},\\"directives\\":[],\\"selectionSet\\":{\\"kind\\":\\"SelectionSet\\",\\"selections\\":[{\\"kind\\":\\"Field\\",\\"name\\":{\\"kind\\":\\"Name\\",\\"value\\":\\"hello\\"},\\"arguments\\":[],\\"directives\\":[]}]}},{\\"kind\\":\\"FragmentDefinition\\",\\"name\\":{\\"kind\\":\\"Name\\",\\"value\\":\\"Thing_c\\"},\\"typeCondition\\":{\\"kind\\":\\"NamedType\\",\\"name\\":{\\"kind\\":\\"Name\\",\\"value\\":\\"Query\\"}},\\"directives\\":[],\\"selectionSet\\":{\\"kind\\":\\"SelectionSet\\",\\"selections\\":[{\\"kind\\":\\"FragmentSpread\\",\\"name\\":{\\"kind\\":\\"Name\\",\\"value\\":\\"Thing_a\\"},\\"directives\\":[]},{\\"kind\\":\\"Field\\",\\"name\\":{\\"kind\\":\\"Name\\",\\"value\\":\\"other\\"},\\"arguments\\":[],\\"directives\\":[]}]}}]}")
    ",
          "filename": "__generated__/ts-gql/Thing.ts",
          "type": "output",
        },
      ],
    }
  `);
});
