import _gql from "graphql-tag";

export const gql = (...args) => () => _gql(...args);
