# Svelte Integration (Roadmap)

Svelte support is in active development. The planned package
`minuta-svelte` will provide:

- `createTemporalStore(options)` — Wraps the builder in a readable store so
  components react to `browsing`/`now` updates.
- `usePeriodStore(temporal, unit)` — Returns derived stores for each period,
  mirroring the Vue/React helpers.
- Lightweight helpers for binding adapters to reactive statements.

Follow the changelog for updates as the API solidifies.
