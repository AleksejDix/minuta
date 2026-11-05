import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";

/*
 * Calendars that only native Temporal computes: Chromium and Firefox have
 * it, the polyfill fails on Chinese, Dangi, Coptic and Ethiopic dates.
 * WebKit has no Temporal yet, so it would test the polyfill again.
 */
export default defineConfig({
  test: {
    browser: {
      enabled: true,
      headless: true,
      instances: [{ browser: "chromium" }, { browser: "firefox" }],
      provider: playwright({
        contextOptions: { timezoneId: process.env["TZ"] ?? "Europe/Zurich" },
      }),
    },
    include: ["src/**/*.browser.test.ts"],
  },
});
