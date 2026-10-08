import { defineConfig } from "vitest/config";
import path from "node:path";

const CORE_SOURCE = path.resolve(import.meta.dirname, "../minuta/src");

function core(file: string): string {
  return path.resolve(CORE_SOURCE, file);
}

// Tests run against the core's source, not its build
export default defineConfig({
  resolve: {
    alias: {
      minuta: core("index.ts"),
      "minuta/native": core("native.ts"),
      "minuta/operations": core("operations.ts"),
      "minuta/temporal": core("temporal.ts"),
      "minuta/types": core("types.ts"),
    },
  },
  test: {
    environment: "node",
    globals: false,
    include: ["src/**/*.test.ts"],
    setupFiles: path.resolve(import.meta.dirname, "../../vitest.setup.ts"),
  },
});
