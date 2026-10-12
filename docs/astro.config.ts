import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import starlight from "@astrojs/starlight";
import tailwindcss from "@tailwindcss/vite";
import vue from "@astrojs/vue";

export default defineConfig({
  integrations: [
    starlight({
      customCss: ["./src/styles/global.css"],
      sidebar: [{ items: ["getting-started"], label: "Start here" }],
      social: [
        {
          href: "https://github.com/AleksejDix/minuta",
          icon: "github",
          label: "GitHub",
        },
      ],
      title: "minuta",
    }),
    react(),
    vue(),
  ],
  vite: { plugins: [tailwindcss()] },
});
