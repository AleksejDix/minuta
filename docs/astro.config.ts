import type { AstroIntegration, ViteUserConfig } from "astro";
import { API_GROUPS } from "./src/components/api-groups";
import { defineConfig } from "astro/config";
import path from "node:path";
import react from "@astrojs/react";
import starlight from "@astrojs/starlight";
import starlightSidebarTopics from "starlight-sidebar-topics";
import tailwindcss from "@tailwindcss/vite";
import vue from "@astrojs/vue";

type VitePlugin = Extract<
  NonNullable<ViteUserConfig["plugins"]>[number],
  { name: string }
>;

const ALIAS = "@/";
const DEMO_SOURCES = [
  "../packages/minuta-react/examples/src",
  "../packages/minuta-vue/examples/src",
].map((source) => path.resolve(import.meta.dirname, source));

// Where `source` points when it is a demo's `@/…` import, else `source` itself
function demoTarget(source: string, importer: string | undefined): string {
  if (importer === undefined || !source.startsWith(ALIAS)) {
    return source;
  }
  const root = DEMO_SOURCES.find((demo) => importer.startsWith(demo));
  if (root === undefined) {
    return source;
  }
  return path.join(root, source.slice(ALIAS.length));
}

/**
 * Both demos import their shadcn parts as `@/…`, each from its own `src`;
 * resolve the alias against the demo the import comes from.
 */
const demoAlias: VitePlugin = {
  enforce: "pre",
  name: "minuta-demo-alias",
  // oxlint-disable-next-line typescript/prefer-readonly-parameter-types -- Rollup's resolve options are not deeply readonly
  resolveId: async function resolveId(source, importer, options) {
    const resolved = await this.resolve(
      demoTarget(source, importer),
      importer,
      {
        isEntry: options.isEntry,
        skipSelf: true,
      }
    );
    return resolved;
  },
};

const docs: AstroIntegration = starlight({
  components: {
    Header: "./src/components/Header.astro",
    Hero: "./src/components/Hero.astro",
  },
  customCss: ["./src/styles/global.css"],
  expressiveCode: {
    styleOverrides: {
      borderRadius: "0.75rem",
      codeFontFamily: "'Fragment Mono', ui-monospace, monospace",
    },
    themes: ["vitesse-dark", "vitesse-light"],
  },
  head: [
    // The browser bar matches the header in light and dark
    {
      attrs: {
        content: "#f1ebdf",
        media: "(prefers-color-scheme: light)",
        name: "theme-color",
      },
      tag: "meta",
    },
    {
      attrs: {
        content: "#161512",
        media: "(prefers-color-scheme: dark)",
        name: "theme-color",
      },
      tag: "meta",
    },
  ],
  plugins: [
    // Guide and API, each with its own sidebar, like Vue's docs
    starlightSidebarTopics([
      {
        icon: "open-book",
        items: [
          {
            items: ["introduction", "getting-started", "installation"],
            label: "Getting started",
          },
          {
            items: [
              "concepts/periods-and-units",
              { autogenerate: { directory: "guide/essentials" } },
            ],
            label: "Essentials",
          },
          {
            items: [
              "concepts/weeks-and-calendars",
              "concepts/time-zones",
              { autogenerate: { directory: "guide/calendars" } },
            ],
            label: "Calendars",
          },
          { items: ["concepts/date-engines"], label: "Date engines" },
          {
            items: [
              "concepts/the-input-stack",
              "concepts/parsing-dates",
              { autogenerate: { directory: "guide/date-field" } },
            ],
            label: "The date field",
          },
          { items: ["demo"], label: "Try it" },
        ],
        label: "Guide",
        link: "/introduction/",
      },
      {
        icon: "seti:json",
        items: [
          "api",
          ...API_GROUPS.map(([directory, label]) => ({
            collapsed: true,
            items: [{ autogenerate: { directory: `api/${directory}` } }],
            label,
          })),
        ],
        label: "API",
        link: "/api/",
      },
    ]),
  ],
  routeMiddleware: "./src/route-data.ts",
  social: [
    {
      href: "https://github.com/AleksejDix/minuta",
      icon: "github",
      label: "GitHub",
    },
  ],
  title: "minuta",
});

export default defineConfig({
  // Served by GitHub Pages under the account's domain: https://dix.consulting/minuta/
  base: "/minuta",
  integrations: [docs, react(), vue()],
  site: "https://dix.consulting",
  vite: { plugins: [demoAlias, tailwindcss()] },
});
