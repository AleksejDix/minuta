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
        calendar: fromRoot("src/calendar.ts"),
        "date-fns": fromRoot("src/date-fns.ts"),
        "date-fns-tz": fromRoot("src/date-fns-tz.ts"),
        dayjs: fromRoot("src/dayjs.ts"),
        helpers: fromRoot("src/helpers.ts"),
        index: fromRoot("src/index.ts"),
        luxon: fromRoot("src/luxon.ts"),
        moment: fromRoot("src/moment.ts"),
        native: fromRoot("src/native.ts"),
        operations: fromRoot("src/operations.ts"),
        segments: fromRoot("src/segments.ts"),
        temporal: fromRoot("src/temporal.ts"),
      },
      formats: ["es"],
    },
    rollupOptions: {
      external: [
        "dayjs",
        "dayjs/plugin/quarterOfYear",
        "date-fns",
        "date-fns-tz",
        "luxon",
        "moment",
        "@js-temporal/polyfill",
      ],
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
});
