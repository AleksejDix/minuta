# Vue 3 Integration

`minuta-vue` wraps the core primitives in Composition API
helpers so `browsing`, `now`, and derived periods stay reactive throughout your
component tree.

- Provides/injects automatically so nested components can call `useMinuta()`.
- Accepts `ref`/`computed` adapters for reactive configuration.
- Ships a Vue-only bundle that keeps tree-shaking tight (<22 KB gzipped).

## Installation

```bash
npm install minuta \
  minuta-vue \
  minuta/native
```

## Usage inside `<script setup>`

```vue
<script setup lang="ts">
import { ref } from "vue";
import { createTemporal, usePeriod } from "minuta-vue";
import { createNativeAdapter } from "minuta/native";

const date = ref(new Date());
const temporal = createTemporal({
  adapter: createNativeAdapter({ weekStartsOn: 1 }),
  date,
});

const month = usePeriod(temporal, "month");
const weeks = temporal.divide(month.value, "week");
</script>

<template>
  <header>
    <button @click="temporal.previous(temporal.browsing)">Prev</button>
    <span>{{ month.value.label }}</span>
    <button @click="temporal.next(temporal.browsing)">Next</button>
  </header>

  <div class="weeks">
    <div v-for="week in weeks" :key="week.id">
      {{ week.start.toDateString() }}
    </div>
  </div>
</template>
```

## Reactive adapter settings

```ts
import { computed, ref } from "vue";
import { createTemporal } from "minuta-vue";
import { createNativeAdapter } from "minuta/native";

const weekStartsOn = ref(1);
const temporal = createTemporal({
  adapter: computed(() =>
    createNativeAdapter({ weekStartsOn: weekStartsOn.value })
  ),
  date: ref(new Date()),
});

weekStartsOn.value = 0; // Browsing periods recompute automatically
```

## Build a Calendar UI

Real apps split temporal logic across components. Here's how to structure a
month calendar using provide/inject so every child automatically stays in sync.

### Live demo

<Calendar />

The widget above runs directly in VitePress and pulls from the same Vue package
you install locally. Use it as a reference while exploring the breakdown below.

### Renderless `<Temporal>` provider

Prefer declarative providers? Drop the `Temporal` component anywhere to create,
provide, and expose a builder in one move:

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Temporal } from "minuta-vue";
import { createNativeAdapter } from "minuta/native";

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

The component automatically injects the builder for descendants while the slot
lets the immediate template access it without extra boilerplate.

### 1. Provide the builder at the layout level

```vue
<!-- TemporalProvider.vue -->
<script setup lang="ts">
import { ref } from "vue";
import { createTemporal } from "minuta-vue";
import { createNativeAdapter } from "minuta/native";

const date = ref(new Date());
const temporal = createTemporal({
  adapter: createNativeAdapter({ weekStartsOn: 1 }),
  date,
});
</script>

<template>
  <slot :temporal="temporal" />
</template>
```

Mount this component once (e.g., in `App.vue`). Children can now call
`useMinuta()`—no prop drilling required.

### 2. Navigation controls with `usePeriod`

```vue
<!-- MonthHeader.vue -->
<script setup lang="ts">
import { useMinuta, usePeriod } from "minuta-vue";

const temporal = useMinuta();
const month = usePeriod(temporal, "month");
</script>

<template>
  <header class="month-header">
    <button @click="temporal.previous(month.value)">←</button>
    <h2>
      {{ month.value.date.toLocaleString("en-US", { month: "long", year: "numeric" }) }}
    </h2>
    <button @click="temporal.next(month.value)">→</button>
  </header>
</template>
```

### 3. Render the grid with divide()

```vue
<!-- MonthGrid.vue -->
<script setup lang="ts">
import { computed } from "vue";
import { useMinuta, usePeriod } from "minuta-vue";

const temporal = useMinuta();
const month = usePeriod(temporal, "month");

const weeks = computed(() =>
  temporal.divide(month.value, "week").map((week) => ({
    id: week.id,
    days: temporal.divide(week, "day"),
  }))
);
</script>

<template>
  <div class="weeks">
    <div v-for="week in weeks" :key="week.id" class="week">
      <button
        v-for="day in week.days"
        :key="day.id"
        class="day"
        :class="{ 'is-other-month': !temporal.contains(month.value, day.date) }"
        @click="$emit('select', day)"
      >
        {{ day.date.getDate() }}
      </button>
    </div>
  </div>
</template>
```

With this structure, every component reacts to navigation changes while keeping
concerns isolated (header, grid, detail panes, etc.). Check
`packages/minuta-vue/src/components/CalendarExample.vue` (and the Vite app
under `packages/minuta-vue/examples/`) for a runnable version of this pattern.

## API surface

- `createTemporal(options)` — Creates + provides the builder with reactive
  `browsing`/`now`.
- `useMinuta()` — Injects the closest provided instance for child components.
- `usePeriod(temporal, unit)` — Returns a computed period that updates with
  `browsing` or `unit` changes.

### `VueTemporal` type

`createTemporal()` returns a builder that includes all core shortcuts (`period`,
`divide`, `next`, `previous`, `go`, `split`, etc.) in addition to the reactive
refs:

```ts
interface VueTemporal {
  adapter: Adapter;
  weekStartsOn: number;
  browsing: Ref<Period>;
  now: Ref<Period> | ComputedRef<Period>;
}

interface TemporalBuilder extends VueTemporal {
  period(date: Date, unit: Unit): Period;
  divide(period: Period, unit: AdapterUnit): Period[];
  next(period: Period, count?: number): Period;
  previous(period: Period, count?: number): Period;
  go(period: Period, count: number): Period;
  split(period: Period, date: Date): [Period, Period];
  contains(period: Period, target: Date | Period): boolean;
  isSame(a: Period, b: Period, unit: AdapterUnit | "custom"): boolean;
  merge(periods: Period[], unit?: AdapterUnit): Period | null;
}
```

Because `TemporalBuilder` extends `VueTemporal`, components get typed access to
both the reactive refs and every helper method returned by the builder.
