import type { AstroIntegration, ViteUserConfig } from "astro";
import { defineConfig } from "astro/config";
import path from "node:path";
import react from "@astrojs/react";
import starlight from "@astrojs/starlight";
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

// One reference group per entry point: [directory under api/, label]
const API_GROUPS: readonly (readonly [string, string])[] = [
  ["minuta", "minuta"],
  ["minuta-core", "minuta/core"],
  ["minuta-calendar", "minuta/calendar"],
  ["minuta-intervals", "minuta/intervals"],
  ["minuta-format", "minuta/format"],
  ["adapters", "Date engines"],
  ["minuta-react", "minuta-react"],
  ["minuta-vue", "minuta-vue"],
  ["datefield", "datefield"],
  ["input-dom", "input-dom"],
  ["input-state", "input-state"],
  ["text-buffer", "text-buffer"],
  ["fechita", "fechita"],
];

const docs: AstroIntegration = starlight({
  customCss: ["./src/styles/global.css"],
  sidebar: [
    {
      items: ["introduction", "installation", "getting-started", "demo"],
      label: "Start here",
    },
    { items: [{ autogenerate: { directory: "concepts" } }], label: "Concepts" },
    {
      items: API_GROUPS.map(([directory, label]) => ({
        collapsed: true,
        items: [{ autogenerate: { directory: `api/${directory}` } }],
        label,
      })),
      label: "Reference",
    },
  ],
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
