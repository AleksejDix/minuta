# @allystudio/usetemporal-vue

Vue integration package for `@allystudio/usetemporal`. Built directly on the
Vue 3 runtime and Composition API, it exposes composables that wrap the core
library so `browsing`, `now`, and derived periods remain fully reactive inside
Vue applications.

## Installation

```bash
npm install @allystudio/usetemporal @allystudio/usetemporal-vue
```

Install whichever adapter you need (the core ships the native adapter entry):

```bash
npm install @allystudio/usetemporal/native
```

## Quick Start

```ts
import { ref } from "vue";
import {
  createTemporal,
  useTemporal,
  usePeriod,
} from "@allystudio/usetemporal-vue";
import { createNativeAdapter } from "@allystudio/usetemporal/native";

const date = ref(new Date());
const now = ref(new Date());

// Call inside setup to create + provide the temporal instance
const temporal = createTemporal({
  adapter: createNativeAdapter(),
  date,
  now,
});

const month = usePeriod(temporal, "month");

// Child components can access the same instance via the injector:
const nestedTemporal = useTemporal();

month.value.start; // Reactive!
```

### Reactive adapter settings

```ts
import { computed, ref } from "vue";
import { createTemporal } from "@allystudio/usetemporal-vue";
import { createNativeAdapter } from "@allystudio/usetemporal/native";

const weekStartsOn = ref(1);
const temporal = createTemporal({
  adapter: computed(() =>
    createNativeAdapter({ weekStartsOn: weekStartsOn.value })
  ),
  date: ref(new Date()),
});

weekStartsOn.value = 0; // automatically recalculates browsing periods
```

### Declarative `<Temporal>` provider

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Temporal } from "@allystudio/usetemporal-vue";
import { createNativeAdapter } from "@allystudio/usetemporal/native";

const adapter = createNativeAdapter({ weekStartsOn: 1 });
const date = ref(new Date());
</script>

<template>
  <Temporal :adapter="adapter" :date="date" lang="zh-CN" v-slot="{ temporal }">
    <MonthHeader />
    <MonthGrid />
  </Temporal>
</template>
```

The component automatically creates + provides the builder instance and exposes
it through the default slot for renderless patterns.

### API

- `createTemporal(options: CreateTemporalOptions): TemporalBuilder`  
  Creates (and automatically provides) a reactive temporal instance. Pass Vue
  refs for both `date` and (optionally) `now` so you remain in control of
  reactivity. Methods from the builder delegate to the core operations while
  passing the adapter automatically. Optionally provide `locale` (defaults to
  `"en"`) to keep downstream UI helpers in sync with your preferred language.

- `useTemporal(): TemporalBuilder`  
  Injects the nearest provided temporal instance so nested components can tap
  into the same builder without prop drilling.

- `usePeriod(temporal: VueTemporal, unit: Unit | Ref<Unit>): ComputedRef<Period>`  
  Returns a computed period that updates when `browsing` changes or the unit
  ref updates.

- `<Temporal adapter="..." :date="..." :now="..." :week-starts-on="...">`  
  Renderless provider that wraps `createTemporal()`, injects it, and exposes the
  builder via the default slot. Pass `lang="fr-FR"` (or any BCP 47 locale) to
  synchronize UI formatting helpers like weekday views.

### Migration from `createTemporal`

```ts
// Before (core package)
import { ref } from "vue";
import { createTemporal, usePeriod } from "@allystudio/usetemporal";

const date = ref(new Date());
const temporal = createTemporal({ adapter, date });

// After
import { ref } from "vue";
import { createTemporal, usePeriod } from "@allystudio/usetemporal-vue";

const date = ref(new Date());
const temporal = createTemporal({ adapter, date });
```

## Scripts

- `npm run build --workspace=@allystudio/usetemporal-vue`
- `TZ=UTC npm test --workspace=@allystudio/usetemporal-vue`
- `npm run type-check --workspace=@allystudio/usetemporal-vue`

## Example playground

Run the bundled Vite playground directly from this workspace to experiment with
the composables and shipped calendar component:

```bash
cd packages/usetemporal-vue/examples
npm install
npm run dev
```

It imports the workspace source directly, so any local changes are reflected
instantly. You can also consume the packaged demo component via
`@allystudio/usetemporal-vue/components`.

## Components entry point

`@allystudio/usetemporal-vue/components` ships ready-to-run Vue components that
mirror our docs examples. Import the `CalendarExample` anywhere you want a quick
sandbox:

```vue
<script setup lang="ts">
import { CalendarExample } from "@allystudio/usetemporal-vue/components";
</script>

<template>
  <CalendarExample />
</template>
```

## Documentation

Complete docs live at https://usetemporal.vercel.app.

## License

Apache 2.0 © Aleksej Dix
