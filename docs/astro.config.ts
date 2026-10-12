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

const docs: AstroIntegration = starlight({
  customCss: ["./src/styles/global.css"],
  sidebar: [
    { items: ["getting-started"], label: "Start here" },
    { items: ["demo"], label: "Try it" },
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
  integrations: [docs, react(), vue()],
  vite: { plugins: [demoAlias, tailwindcss()] },
});
