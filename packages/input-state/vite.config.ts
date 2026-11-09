import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import path from "node:path";
import { relativeTypes } from "@minuta/tsconfig/relative-types.ts";

export default defineConfig({
  build: {
    lib: {
      entry: { index: path.resolve(import.meta.dirname, "src/index.ts") },
      formats: ["es"],
    },
    rollupOptions: {
      external: ["@aleksejdix/text-buffer"],
    },
  },
  plugins: [
    dts({
      beforeWriteFile: relativeTypes(import.meta.dirname),
      include: ["src/**/*.ts"],
      insertTypesEntry: true,
    }),
  ],
});
