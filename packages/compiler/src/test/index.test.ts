import fs from "fs-extra";
import path from "path";
import fixturez from "fixturez";
import { parse } from "graphql";
import { getGeneratedTypes } from "../get-generated-types";
import { getConfig } from "@ts-gql/config";
import { schema } from "./test-schema";

let f = fixturez(__dirname);

async function build(cwd: string) {
  return getGeneratedTypes(await getConfig(cwd));
}

async function setupEnv(specificSchema: string = schema) {
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
  promises.push(
    fs.writeFile(path.join(tempdir, "schema.graphql"), specificSchema)
  );
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
  await buildAndSnapshot(dir);
});

// test("other", async () => {
//   let dir = await setupEnv(payrollSchema);

//   await fs.writeFile(
//     path.join(dir, "index.tsx"),
//     makeSourceFile([
//       graphql`
//         fragment SelectedPayrunEmployees_employee on EmployeePayrun {
//           earnings {
//             id
//             amount
//           }
//         }
//       `,
//       graphql`
//         fragment EditPayrunEmployees_payrun on Payrun {
//           employees {
//             employee {
//               id
//             }
//           }
//         }
//       `,
//       graphql`
//         fragment SelectedPayrunEmployees_payrun on Payrun {
//           employees {
//             ...SelectedPayrunEmployees_employee
//           }
//           ...EditPayrunEmployees_payrun
//         }
//       `,
//     ])
//   );
//   await buildAndSnapshot(dir);
// });
