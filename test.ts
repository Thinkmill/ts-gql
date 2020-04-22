import { useQuery, QueryHookOptions, QueryResult } from "@apollo/client";
import _gql from "graphql-tag";
import { DocumentNode } from "graphql";

interface Documents {
  Thing: {
    type: "query";
    document: "query Thing {\n yes\n }\n}";
    result: { yes: string };
    variables: undefined;
  };
  OtherThing: {
    type: "query-with-variables";
    document: "query OtherThing {\n yes\n }\n}";
    result: { yes: string };
    variables: { thing: boolean };
  };
}

let query = gql`
  query Thing {
    yes
  }
`("Thing");

let { data } = useQuery(query);

let query2 = gql`
  query OtherThing {
    yes
  }
`("OtherThing");

let { data: data2 } = useQuery(query2, { variables: { thing: false } });
