# Vue calendar demo

Vue demo showcasing the `CalendarExample` component that now ships from
`@allystudio/usetemporal-vue/components`.

## Getting started

```bash
npm run dev --workspace=@allystudio/usetemporal-vue
```

- `npm run dev --workspace=…` – Launches the demo from the package Vite config
- `npm run demo:build --workspace=…` – Builds the demo SPA output
- `npm run build --workspace=…` – Builds the library bundle (unchanged)

## Project structure

```
packages/usetemporal-vue/examples/
├── src/
│   ├── App.vue
│   ├── assets/
│   └── main.ts
├── public/
├── index.html
├── tsconfig*.json
└── (shared root Vite config)
```

The app renders `<CalendarExample />` from the framework package so docs, tests,
and sandboxes can all point to the same component source.
