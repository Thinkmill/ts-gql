import { watch } from "@ts-gql/compiler";

export const withTsGql = (internalConfig: any = {}) => (
  phase:
    | "phase-export"
    | "phase-production-build"
    | "phase-production-server"
    | "phase-development-server",
  thing: any
) => {
  if (phase === "phase-development-server") {
    watch(process.cwd()).catch((err) => {
      console.error(err.toString());
      process.exit(1);
    });
  }
  let internalConfigObj =
    typeof internalConfig === "function"
      ? internalConfig(phase, thing)
      : internalConfig;
  return {
    ...internalConfigObj,
    webpack(webpackConfig: any, options: any) {
      if (!options.defaultLoaders.babel.options.plugins) {
        options.defaultLoaders.babel.options.plugins = [];
      }
      options.defaultLoaders.babel.options.plugins.unshift(
        require.resolve("@ts-gql/babel-plugin")
      );
      return internalConfigObj.webpack
        ? internalConfigObj.webpack(webpackConfig, options)
        : webpackConfig;
    },
  };
};
