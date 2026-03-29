# minuta-svelte

Svelte integration package for `minuta`. It wraps the core
library with idiomatic store helpers so `browsing`, `now`, and derived periods
stay reactive inside Svelte components without additional glue code.

## Installation

```bash
npm install minuta minuta-svelte
```

Install whichever adapter you need (the core ships the native adapter entry):

```bash
npm install minuta/native
```

## Quick Start

```svelte
<script lang="ts">
  import { writable } from "svelte/store";
  import {
    createTemporal,
    useMinuta,
    usePeriod
  } from "minuta-svelte";
  import { createNativeAdapter } from "minuta/native";

  const date = writable(new Date());
  const now = writable(new Date());

  // Call inside a component to create + provide the temporal instance
  const temporal = createTemporal({
    adapter: createNativeAdapter(),
    date,
    now,
  });

  const month = usePeriod(temporal, "month");

  // Children can access the same builder from context
  const nestedTemporal = useMinuta();
</script>

{#await $month}
  <!-- reactive period -->
{/await}
```

### Reactive adapter settings

```ts
import { derived, writable } from "svelte/store";
import { createTemporal } from "minuta-svelte";
import { createNativeAdapter } from "minuta/native";

const weekStartsOn = writable(1);
const date = writable(new Date());

const temporal = createTemporal({
  adapter: createNativeAdapter({ weekStartsOn: 1 }),
  date,
});

weekStartsOn.set(0); // recompute derived periods through store updates
```

### API

- `createTemporal(options: CreateMinutaOptions): TemporalBuilder`  
  Creates (and automatically provides) a reactive temporal instance. Pass a
  Svelte `Writable<Date>` for `date` (and optionally for `now`) to stay in
  control of reactivity. Methods from the builder delegate to the core
  operations while passing the adapter automatically. Optionally provide
  `locale` (defaults to `"en"`).

- `useMinuta(): TemporalBuilder`  
  Injects the nearest provided temporal instance so nested components can reuse
  the same builder without prop drilling.

- `usePeriod(temporal: SvelteTemporal, unit: Unit | Readable<Unit>): Readable<Period>`  
  Returns a derived store that updates when `browsing` or the unit store
  changes.

## Drop-in component

Need a working calendar fast? Import the packaged component:

```svelte
<script lang="ts">
  import { CalendarExample } from "minuta-svelte/components";
</script>

<CalendarExample />
```

## Scripts

- `npm run build --workspace=minuta-svelte`
- `TZ=UTC npm test --workspace=minuta-svelte`
- `npm run type-check --workspace=minuta-svelte`

## Documentation

Complete docs live at https://minuta.vercel.app.

## License

Apache 2.0 © Aleksej Dix
