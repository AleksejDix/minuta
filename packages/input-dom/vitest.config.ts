import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";

/*
 * Run in the browsers input-dom is used in, not in a simulated DOM. CI runs
 * WebKit too; locally it needs system libraries some Linux hosts lack.
 */
const browsers = ["chromium", "firefox", "webkit"].filter(
  (browser) => browser !== "webkit" || process.env["CI"] !== undefined
);

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      headless: true,
      instances: browsers.map((browser) => ({ browser })),
      provider: playwright(),
    },
    include: ["src/**/*.test.ts"],
  },
});
