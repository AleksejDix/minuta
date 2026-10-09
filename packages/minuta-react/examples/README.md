# React calendar demo

Interactive React demo showcasing how to pair `minuta-react`
with the core divide() operations. The calendar highlights:

- Context-driven calendar parts built on `MinutaRoot`
- A segmented date field built the same way

## Getting started

```bash
npm run dev --workspace=minuta-react
```

- `npm run dev --workspace=…` – Launches the demo using the package's Vite config
- `npm run demo:build --workspace=…` – Builds the demo SPA (optional)
- `npm run build --workspace=…` – Builds the library bundle (unchanged)

## Project structure

```
packages/minuta-react/examples/
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

- **Calendar parts** – `CalendarRoot` with `CalendarHeader` and the
  keyboard-navigable `CalendarGrid` from `minuta-react/components`
- **Date field** – `DateFieldRoot` owns the vanilla `input-dom` controller
  (datefield mask, arrow-key rotation, day clamping); `DateFieldInput` and
  `DateFieldOutput` read it through `useDateFieldContext()`
- **Selection** – picking a day in the calendar sets the field's value; the
  locale select drives the field format and the calendar labels

See the [minuta README](https://github.com/AleksejDix/minuta/tree/master/packages/minuta) for the full core API.
