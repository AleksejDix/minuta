import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import path from "node:path";
import { readdirSync } from "node:fs";

const SOURCE = path.resolve(import.meta.dirname, "src");
// oxlint-disable-next-line node/no-sync -- Vite loads its config synchronously
const LOCALES = readdirSync(path.join(SOURCE, "locales")).filter((file) =>
  file.endsWith(".ts")
);

const MAIN_ENTRIES: Record<string, string> = {
  core: path.join(SOURCE, "core.ts"),
  index: path.join(SOURCE, "index.ts"),
};

// One entry per locale, so `fechita/locales/de` ships only German
const localeEntries = Object.fromEntries(
  LOCALES.map((file) => [
    `locales/${file.replace(/\.ts$/u, "")}`,
    path.join(SOURCE, "locales", file),
  ])
);

export default defineConfig({
  build: {
    lib: {
      entry: Object.assign(MAIN_ENTRIES, localeEntries),
      formats: ["es"],
    },
  },
  plugins: [
    dts({
      exclude: ["src/**/*.test.ts", "src/__tests__/**"],
      include: ["src/**/*.ts"],
    }),
  ],
});
