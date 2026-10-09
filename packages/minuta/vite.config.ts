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
        core: fromRoot("src/core.ts"),
        "date-fns": fromRoot("src/date-fns.ts"),
        "date-fns-tz": fromRoot("src/date-fns-tz.ts"),
        dayjs: fromRoot("src/dayjs.ts"),
        format: fromRoot("src/format.ts"),
        index: fromRoot("src/index.ts"),
        intervals: fromRoot("src/intervals.ts"),
        luxon: fromRoot("src/luxon.ts"),
        moment: fromRoot("src/moment.ts"),
        native: fromRoot("src/native.ts"),
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
