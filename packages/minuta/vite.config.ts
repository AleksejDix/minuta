import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { resolve } from "path";

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      include: ["src/**/*.ts"],
    }),
  ],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        operations: resolve(__dirname, "src/operations.ts"),
        calendar: resolve(__dirname, "src/calendar.ts"),
        helpers: resolve(__dirname, "src/helpers.ts"),
        native: resolve(__dirname, "src/native.ts"),
        dayjs: resolve(__dirname, "src/dayjs.ts"),
        "date-fns": resolve(__dirname, "src/date-fns.ts"),
        "date-fns-tz": resolve(__dirname, "src/date-fns-tz.ts"),
        luxon: resolve(__dirname, "src/luxon.ts"),
        moment: resolve(__dirname, "src/moment.ts"),
        temporal: resolve(__dirname, "src/temporal.ts"),
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
});
