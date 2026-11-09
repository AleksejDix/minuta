import { configDefaults } from "vitest/config";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import path from "node:path";

function fromRoot(file: string): string {
  return path.resolve(import.meta.dirname, file);
}

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: fromRoot("src/index.ts"),
        temporal: fromRoot("src/temporal.ts"),
      },
      formats: ["es"],
    },
    rollupOptions: {
      external: ["temporal-polyfill", "temporal-polyfill/full"],
      output: {
        preserveModules: false,
      },
    },
  },
  plugins: [
    dts({
      include: ["src/**/*.ts"],
      insertTypesEntry: true,
    }),
  ],
  test: {
    // Native Temporal only: vitest.browser.config.ts runs these
    exclude: [...configDefaults.exclude, "src/**/*.browser.test.ts"],
    setupFiles: [fromRoot("../../vitest.setup.ts")],
  },
});
