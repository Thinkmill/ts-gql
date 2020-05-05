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
    watch(process.cwd());
  }
  return typeof internalConfig === "function"
    ? internalConfig(phase, thing)
    : internalConfig;
};
