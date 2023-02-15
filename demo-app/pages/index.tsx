import type { OperationData } from "@ts-gql/tag/no-transform";
import { gql } from "@ts-gql/tag/no-transform";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import { Fragment } from "react";

import { fetchGraphQL } from "../fetch-graphql";

const getCountriesQuery = gql`
  query getCountries {
    continents {
      name
      countries {
        name
        emoji
      }
    }
  }
` as import("../__generated__/ts-gql/getCountries").type;

// You can use `OperationData` to extract the types from a query or mutation.
type Continents = OperationData<typeof getCountriesQuery>["continents"];

export const getServerSideProps: GetServerSideProps<{
  continents: Continents;
}> = async () => {
  const result = await fetchGraphQL(getCountriesQuery);

  if (!result.continents) {
    throw new Error("Query failed");
  }

  return {
    props: {
      continents: result.continents,
    },
  };
};

export default function Home({
  continents,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <Fragment>
      <Head>
        <title>ts-gql demo</title>
        <meta
          name="description"
          content="Demo Next.js site showing how to set up ts-gql"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="px-4 py-8 max-w-5xl mx-auto flex flex-col gap-4">
        <h1 className="text-4xl font-semibold">ts-gql demo</h1>
        <p>
          This is a demo of ts-gql using the Countries API found here:{" "}
          <a
            href="https://countries.trevorblades.com/"
            className="text-blue-700 underline"
          >
            https://countries.trevorblades.com/
          </a>
        </p>
        <p>
          You can learn more about ts-gql here:{" "}
          <a
            href="https://github.com/thinkmill/ts-gql"
            className="text-blue-700 underline"
          >
            https://github.com/thinkmill/ts-gql
          </a>
        </p>
        <div className="flex flex-col gap-4">
          {continents.map((continent) => (
            <div
              key={continent.name}
              className="flex flex-col gap-8 border p-4 rounded shadow-inner bg-gray-100"
            >
              <h2 className="text-3xl font-semibold">{continent.name}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {continent.countries.map((country) => (
                  <div key={country.name}>
                    <span aria-label={`Flag for ${country.name}`} role="img">
                      {country.emoji}
                    </span>{" "}
                    {country.name}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </Fragment>
  );
}
