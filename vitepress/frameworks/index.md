# Frameworks

Minuta keeps the core strictly functional, then layers framework-specific
packages for idiomatic reactivity. Pick your stack to see how to wire the
builder API into real apps.

## Supported Today

- [Vue 3 (Composition API)](/frameworks/vue) — Composables built on the Vue
  runtime with provide/inject helpers.
- [React 18+](/frameworks/react) — Hooks that mirror the Vue composables via
  standard React state.

## Coming Soon

- [Svelte](/frameworks/svelte) — Store helpers so derived periods stay reactive.
- [Angular](/frameworks/angular) — Injectable services with signal-based values.

Each package exposes the same surface area (`Minuta`, `usePeriod`,
builder methods) so you can share domain logic while keeping UI code idiomatic.
