import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";

/*
 * Calendars on native Temporal, which Chromium and Firefox have; the Node
 * project tests them on the polyfill. WebKit has no Temporal yet, so it
 * would test the polyfill again.
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
