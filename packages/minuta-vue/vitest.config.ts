import { resolve } from "node:path";
import { defineConfig } from "vitest/config";
import viteConfig from "./vite.config";

const coreRoot = resolve(__dirname, "../minuta/src");
const alias = {
  minuta: resolve(coreRoot, "index.ts"),
  "minuta/native": resolve(coreRoot, "native.ts"),
  "minuta/types": resolve(coreRoot, "types.ts"),
  "minuta/temporal": resolve(coreRoot, "temporal.ts"),
  "minuta/operations": resolve(coreRoot, "operations.ts"),
};
const baseResolve = viteConfig.resolve ?? {};
const baseAlias = baseResolve.alias ?? {};

export default defineConfig({
  ...viteConfig,
  resolve: {
    ...baseResolve,
    alias: {
      ...baseAlias,
      ...alias,
    },
  },
  test: {
    ...viteConfig.test,
    globals: false,
    include: ["src/**/*.test.ts"],
  },
});
