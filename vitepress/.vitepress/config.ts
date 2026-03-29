import { defineConfig } from "vitepress";
import path from "node:path";

export default defineConfig({
  title: "Minuta",
  description:
    "Revolutionary time library with unique divide() pattern for hierarchical time management",
  base: "/",
  ignoreDeadLinks: true,

  head: [
    ["meta", { name: "theme-color", content: "#3c8772" }],
    ["meta", { property: "og:type", content: "website" }],
    [
      "meta",
      {
        property: "og:title",
        content: "Minuta - Revolutionary Time Library",
      },
    ],
    [
      "meta",
      {
        property: "og:description",
        content:
          "The only JavaScript time handling library with the divide() pattern, allowing infinite subdivision of time units with perfect synchronization.",
      },
    ],
  ],

  themeConfig: {
    nav: [
      {
        text: "Guide",
        link: "/guide/what-is-minuta",
        activeMatch: "/guide/",
      },
      {
        text: "Frameworks",
        link: "/frameworks/",
        activeMatch: "/frameworks/",
      },
      { text: "API", link: "/api/index", activeMatch: "/api/" },
      {
        text: "v2.0.0",
        items: [
          {
            text: "Changelog",
            link: "https://github.com/AleksejDix/minuta/blob/main/CHANGELOG.md",
          },
          {
            text: "Contributing",
            link: "https://github.com/AleksejDix/minuta/blob/main/CONTRIBUTING.md",
          },
        ],
      },
    ],

    sidebar: {
      "/guide/": [
        {
          text: "Introduction",
          collapsed: false,
          items: [
            {
              text: "What is Minuta?",
              link: "/guide/what-is-minuta",
            },
            { text: "Getting Started", link: "/guide/getting-started" },
          ],
        },
        {
          text: "Core Concepts",
          collapsed: false,
          items: [
            { text: "The divide() Pattern", link: "/guide/divide-pattern" },
          ],
        },
        {
          text: "Reference Guides",
          collapsed: false,
          items: [
            { text: "Operations", link: "/guide/operations" },
            { text: "Bundle Size Optimization", link: "/guide/bundle-size-optimization" },
          ],
        },
      ],

      "/api/": [
        {
          text: "Overview",
          items: [
            { text: "API Reference", link: "/api/" },
          ],
        },
        {
          text: "API Basics",
          collapsed: false,
          items: [
            { text: "Level 1: Pure Functions", link: "/api/level-1-pure-functions" },
          ],
        },
        {
          text: "Operations",
          collapsed: false,
          items: [
            { text: "Overview", link: "/api/operations/" },
            {
              text: "Time Division",
              items: [
                { text: "divide", link: "/api/operations/divide" },
                { text: "split", link: "/api/operations/split" },
                { text: "merge", link: "/api/operations/merge" },
              ],
            },
            {
              text: "Navigation",
              items: [
                { text: "period", link: "/api/operations/period" },
                { text: "next", link: "/api/operations/next" },
                { text: "previous", link: "/api/operations/previous" },
                { text: "go", link: "/api/operations/go" },
              ],
            },
            {
              text: "Comparison",
              items: [
                { text: "isSame", link: "/api/operations/is-same" },
                { text: "contains", link: "/api/operations/contains" },
              ],
            },
          ],
        },
      ],

      "/frameworks/": [
        {
          text: "Overview",
          items: [{ text: "Frameworks", link: "/frameworks/" }],
        },
        {
          text: "Implementations",
          collapsed: false,
          items: [
            { text: "Vue 3", link: "/frameworks/vue" },
            { text: "React 18+", link: "/frameworks/react" },
            { text: "Svelte (Roadmap)", link: "/frameworks/svelte" },
            { text: "Angular (Roadmap)", link: "/frameworks/angular" },
          ],
        },
      ],

      "/examples/": [
        {
          text: "Getting Started",
          items: [
            { text: "Basic Usage", link: "/examples/basic-usage" },
            { text: "Simple Calendar", link: "/examples/calendar" },
            { text: "Interactive Calendar", link: "/examples/interactive-calendar" },
          ],
        },
        {
          text: "Calendar Examples",
          collapsed: false,
          items: [
            { text: "Month Calendar", link: "/examples/calendars/month-calendar" },
            { text: "Year Overview", link: "/examples/calendars/year-overview" },
            { text: "Mini Calendar", link: "/examples/calendars/mini-calendar" },
          ],
        },
        {
          text: "Framework Examples",
          collapsed: false,
          items: [
            { text: "Vue Integration", link: "/examples/frameworks/vue-integration" },
            { text: "React Integration", link: "/examples/frameworks/react-integration" },
            { text: "Vue Calendar", link: "/examples/frameworks/vue-calendar" },
            { text: "React Calendar", link: "/examples/frameworks/react-calendar" },
          ],
        },
        {
          text: "Recipes",
          collapsed: false,
          items: [
            { text: "Business Days", link: "/examples/recipes/business-days" },
            { text: "Time Slots", link: "/examples/recipes/time-slots" },
            { text: "Date Range Picker", link: "/examples/recipes/date-range-picker" },
          ],
        },
      ],

      "/resources/": [
        {
          text: "Educational Resources",
          items: [
            {
              text: "JavaScript Date Quirks",
              link: "/resources/javascript-date-quirks",
            },
            {
              text: "Calendar Systems History",
              link: "/resources/calendar-systems-history",
            },
            {
              text: "Date Formats Worldwide",
              link: "/resources/date-formats-worldwide",
            },
            {
              text: "Timezones in Browsers",
              link: "/resources/timezones-in-browsers",
            },
            { text: "Week Start Days", link: "/resources/week-start-days" },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/AleksejDix/minuta" },
      { icon: "twitter", link: "https://twitter.com/aleksejdix" },
    ],

    footer: {
      message: "Released under the Apache 2.0 License.",
      copyright: "Copyright © 2024-present Minuta Contributors",
    },

    editLink: {
      pattern: "https://github.com/AleksejDix/minuta/edit/main/vitepress/:path",
      text: "Edit this page on GitHub",
    },

    search: {
      provider: "local",
      options: {
        detailedView: true,
        placeholder: "Search docs",
        translations: {
          button: {
            buttonText: "Search",
            buttonAriaLabel: "Search",
          },
          modal: {
            noResultsText: "No results for",
            resetButtonTitle: "Reset search",
            displayDetails: "Display detailed list",
            footer: {
              selectText: "to select",
              navigateText: "to navigate",
              closeText: "to close",
            },
          },
        },
      },
    },

    outline: {
      level: [2, 3],
    },

    docFooter: {
      prev: "Previous page",
      next: "Next page",
    },

    lastUpdated: {
      text: "Last updated",
      formatOptions: {
        dateStyle: "medium",
        timeStyle: "short",
      },
    },

    carbonAds: {
      code: "your-carbon-code",
      placement: "your-carbon-placement",
    },
  },

  markdown: {
    theme: {
      light: "github-light",
      dark: "github-dark",
    },
    lineNumbers: true,
    config: (md) => {
      // Add custom markdown plugins here
    },
  },

  vite: {
    resolve: {
      alias: {
        "minuta-vue": path.resolve(
          __dirname,
          "../../packages/minuta-vue/src"
        ),
        "minuta/native": path.resolve(
          __dirname,
          "../../packages/minuta/src/native.ts"
        ),
        "minuta/calendar": path.resolve(
          __dirname,
          "../../packages/minuta/src/calendar/index.ts"
        ),
      },
    },
  },

  vue: {
    // @vitejs/plugin-vue options
  },
});
