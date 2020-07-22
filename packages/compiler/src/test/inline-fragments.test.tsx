import { buildSchema, validate, parse, print } from "graphql";
import { inlineIntoFirstOperationOrFragment } from "../inline-fragments";
import { schema as _schema } from "./test-schema";

let schema = buildSchema(_schema);

const gql = ([str]: TemplateStringsArray) => str;

function inline(document: string) {
  let ast = parse(document);
  let errors = validate(schema, ast);
  if (errors.length) {
    throw errors[0];
  }
  return print(inlineIntoFirstOperationOrFragment(ast, schema));
}

test("basic", () => {
  expect(
    inline(gql`
      query Thing {
        someObj {
          arr {
            ...Frag_a
          }
          ...Frag_b
        }
      }
      fragment Frag_a on OutputThing {
        other
      }
      fragment Frag_b on OutputThing {
        arr {
          id
        }
      }
    `)
  ).toMatchInlineSnapshot(`
    "query Thing {
      someObj {
        arr {
          other
          id
        }
      }
    }
    "
  `);
});

test("single spread", () => {
  expect(
    inline(gql`
      query Thing {
        someObj {
          ...Frag_a
        }
      }
      fragment Frag_a on OutputThing {
        other
      }
    `)
  ).toMatchInlineSnapshot(`
    "query Thing {
      someObj {
        other
      }
    }
    "
  `);
});

test("interface", () => {
  expect(
    inline(gql`
      query Thing {
        node {
          ...Frag_a
          ...Frag_b
          ...Frag_c
        }
      }
      fragment Frag_a on AnotherNode {
        another
      }
      fragment Frag_b on SomethingNode {
        something
      }

      fragment Frag_c on Node {
        id
      }
    `)
  ).toMatchInlineSnapshot(`
    "query Thing {
      node {
        ... on AnotherNode {
          another
        }
        ... on SomethingNode {
          something
        }
        ... on Node {
          id
        }
      }
    }
    "
  `);
});
