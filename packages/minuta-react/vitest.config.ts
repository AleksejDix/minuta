import { defineConfig } from "vitest/config";
import path from "node:path";
import { playwright } from "@vitest/browser-playwright";

/*
 * Run in the browsers the components are used in, not in a simulated DOM.
 * CI runs WebKit too; locally it needs system libraries some Linux hosts
 * lack. A browser ignores TZ, so the zone is set on its context.
 */
const browsers = ["chromium", "firefox", "webkit"].filter(
  (browser) => browser !== "webkit" || process.env["CI"] !== undefined
);

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "examples/src") },
  },
  test: {
    browser: {
      enabled: true,
      headless: true,
      instances: browsers.map((browser) => ({ browser })),
      provider: playwright({
        contextOptions: { timezoneId: process.env["TZ"] ?? "Europe/Zurich" },
      }),
    },
    globals: false,
    include: [
      "src/**/*.test.ts",
      "src/**/*.test.tsx",
      "examples/src/**/*.test.tsx",
    ],
    setupFiles: [
      path.resolve(import.meta.dirname, "../../vitest.setup.ts"),
      path.resolve(import.meta.dirname, "vitest.setup.ts"),
    ],
  },
});
