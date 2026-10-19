import { defineConfig } from "vitest/config";
import path from "node:path";
import { playwright } from "@vitest/browser-playwright";
import vue from "@vitejs/plugin-vue";

const CORE_SOURCE = path.resolve(import.meta.dirname, "../minuta/src");

function core(file: string): string {
  return path.resolve(CORE_SOURCE, file);
}

/*
 * Run in the browsers the components are used in, not in a simulated DOM.
 * CI runs WebKit too; locally it needs system libraries some Linux hosts
 * lack. A browser ignores TZ, so the zone is set on its context.
 */
const browsers = ["chromium", "firefox", "webkit"].filter(
  (browser) => browser !== "webkit" || process.env["CI"] !== undefined
);

// Tests run against the core's source, not its build
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: [
      {
        find: /^@\//u,
        replacement: `${path.resolve(import.meta.dirname, "examples/src")}/`,
      },
      { find: /^minuta$/u, replacement: core("index.ts") },
      { find: /^minuta\/calendar$/u, replacement: core("calendar.ts") },
      { find: /^minuta\/core$/u, replacement: core("core.ts") },
      { find: /^minuta\/format$/u, replacement: core("format.ts") },
      { find: /^minuta\/native$/u, replacement: core("native.ts") },
    ],
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
    include: ["src/**/*.test.ts", "examples/src/**/*.test.ts"],
    setupFiles: path.resolve(import.meta.dirname, "../../vitest.setup.ts"),
  },
});
