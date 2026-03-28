# React calendar demo

Interactive React demo showcasing how to pair `@allystudio/usetemporal-react`
with the core divide() operations. The calendar highlights:

- `useTemporal` + `usePeriod` coordination
- Derived navigation (next/previous) that keeps browsing state in sync
- Adapter reactivity via a week-start toggle
- `divide()` chains for month → week → day rendering

## Getting started

```bash
npm run dev --workspace=@allystudio/usetemporal-react
```

- `npm run dev --workspace=…` – Launches the demo using the package's Vite config
- `npm run demo:build --workspace=…` – Builds the demo SPA (optional)
- `npm run build --workspace=…` – Builds the library bundle (unchanged)

## Project structure

```
packages/usetemporal-react/examples/
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── index.html
├── tsconfig*.json
└── (shared root Vite config)
```

## Features demonstrated

- **Reactive adapters** – `WeekStartToggle` flips between Sunday/Monday while
  `useMemo` recreates the adapter so browsing + derived periods recalc
- **Derived navigation** – `NavigationControls` passes the active month to
  `temporal.previous/next`, mirroring the Vue behavior
- **divide() pattern** – Calendar rows come from `temporal.divide(month, "week")`
  and each week divides into its days for rendering
- **Educational comments** – Components call out the patterns most teams should
  follow when wiring useTemporal into React apps

For more details visit [usetemporal.vercel.app](https://usetemporal.vercel.app).
