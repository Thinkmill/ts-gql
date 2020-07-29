import crypto from "crypto";
import { GraphQLError } from "graphql";
import { FullSourceLocation } from "./types";

export function hashString(input: string) {
  let md5sum = crypto.createHash("md5");
  md5sum.update(input);
  return md5sum.digest("hex");
}

export function parseTsGqlMeta(content: string) {
  let result = /ts-gql-meta-begin([^]+)ts-gql-meta-end/m.exec(content);
  if (result === null) {
    throw new Error(
      "could not find ts-gql meta in the following contents:\n" + content
    );
  }
  return JSON.parse(result[1]);
}

// based on https://github.com/facebook/fbjs/blob/master/packages/signedsource/index.js

let integrityPlaceholder = "__TS_GQL_INTEGRITY_PLACEHOLDER__";

let pattern = /__TS_GQL_INTEGRITY_([a-f0-9]{32})_TS_GQL_INTEGRITY__/;

export const integrity = {
  placeholder: integrityPlaceholder,
  sign(content: string) {
    let hash = hashString(content);
    return content.replace(
      integrityPlaceholder,
      `__TS_GQL_INTEGRITY_${hash}_TS_GQL_INTEGRITY__`
    );
  },
  verify(content: string) {
    const match = pattern.exec(content);
    if (!match) {
      return false;
    }
    const unsigned = content.replace(pattern, integrityPlaceholder);
    return hashString(unsigned) === match[1];
  },
};

export function locFromSourceAndGraphQLError(
  loc: FullSourceLocation,
  error: GraphQLError
) {
  if (!error.locations || !error.locations.length) {
    return;
  }
  const gqlLocation = error.locations[0];

  // TODO: look at nodes instead of locations so we can get the start AND end
  return {
    start: {
      line: loc.start.line + gqlLocation.line - 1,
      column:
        gqlLocation.line === 1
          ? loc.start.column + gqlLocation.column + 1
          : gqlLocation.column,
    },
    // end: {
    //   line: loc.start.line + gqlLocation.endToken.line - 1,
    //   column:
    //     (gqlLocation.endToken.line === 1
    //       ? loc.end.column + gqlLocation.endToken.column
    //       : gqlLocation.endToken.column) - 1,
    // },
  };
}
