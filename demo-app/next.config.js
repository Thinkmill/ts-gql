/**
 * `@ts-gql/next` starts ts-gql's watcher when you start Next.js's dev server.
 * Note that it _does not_ generate the artifacts when running next build,
 * you should run `ts-gql build` in a script before running `next build`.
 *
 * We're using the `@preconstruct/next` plugin here to make sure that local
 * packages still work. Unless you are using preconstruct in your project,
 * you shouldn't need to use this plugin.
 */

const withPreconstruct = require("@preconstruct/next");
const { withTsGql } = require("@ts-gql/next");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
};

module.exports = withTsGql(withPreconstruct(nextConfig));
