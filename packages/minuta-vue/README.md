# minuta-vue

Vue bindings for [`minuta`](https://github.com/AleksejDix/minuta/tree/master/packages/minuta):
a composable that binds every operation to your units and keeps the browsed
period reactive, a provide/inject root, and composable calendar parts. The API
mirrors `minuta-react`.

```bash
npm install minuta minuta-vue
```

## `useMinuta(options?)`

```vue
<script setup lang="ts">
import { useMinuta } from "minuta-vue";

const minuta = useMinuta({ unit: "month" });
</script>

<template>
  <button @click="minuta.browse(minuta.next(minuta.browsing.value))">
    {{ minuta.browsing.value.start.toDateString() }}
  </button>
</template>
```

Options (all optional; pass a plain object, a ref or a getter such as
`() => props` to keep them reactive):

- `units` – unit specs, default `nativeUnits()` (weeks start on Monday). The
  week start lives in the units: `nativeUnits({ weekStartsOn: "sunday" })`.
- `date` – initially browsed date, default now
- `now` – the moment that counts as "now", default the clock, re-read at the
  start of every new day so "today" never goes stale
- `unit` – unit of the browsed period, default `"month"`

Returns every operation of `withUnits(units)` (`period`, `next`, `previous`,
`shift`, `divide`, `contains`, `same`, `isToday`, …; see the core README),
always bound to the current units, plus:

- `units` – computed, the bound units
- `browsing` – computed `Period`, the browsed period of `unit`
- `now` – computed `Period`, the second containing `now`
- `browse(period)` – browse to the period of `unit` containing `period.start`

## `MinutaRoot`, `useMinutaContext()`, `usePeriod(unit)`

`MinutaRoot` calls `useMinuta(props)` and provides the result; parts read it
with `useMinutaContext()`, which throws outside a `MinutaRoot`.
`usePeriod(unit)` is a computed period of `unit` containing the browsed
period's start.

```vue
<script setup lang="ts">
import { MinutaRoot } from "minuta-vue";
import NextMonth from "./NextMonth.vue";
import Year from "./Year.vue";
</script>

<template>
  <MinutaRoot unit="month">
    <Year />
    <NextMonth />
  </MinutaRoot>
</template>
```

```ts
// Year.vue / NextMonth.vue
const year = usePeriod("year");
const { browse, browsing, next } = useMinutaContext();
```

## Calendar parts (`minuta-vue/components`)

Flat, composable parts that read the context of `CalendarRoot`:

```vue
<script setup lang="ts">
import {
  CalendarDay,
  CalendarGrid,
  CalendarHeader,
  CalendarRoot,
  CalendarWeekdays,
} from "minuta-vue/components";
import { nativeUnits } from "minuta/native";

const sundayFirst = nativeUnits({ weekStartsOn: "sunday" });
</script>

<template>
  <CalendarRoot :units="sundayFirst" @select="(day) => console.log(day.start)">
    <CalendarHeader locale="de-CH" />
    <CalendarWeekdays locale="de-CH" />
    <CalendarGrid>
      <template #day="{ day }">
        <CalendarDay :day="day" />
      </template>
    </CalendarGrid>
  </CalendarRoot>
</template>
```

- `CalendarRoot` – props `units?`, `date?`, emits `select(day)`; a
  `MinutaRoot` browsing months plus the selected day
- `CalendarHeader` – month label (`locale?`) with previous/next buttons
- `CalendarWeekdays` – weekday labels in the week order of the units
- `CalendarGrid` – the stable 42-day month grid; the `#day` slot optionally
  renders each day (default `<CalendarDay :day="day" />`)
- `CalendarDay` – one day (`locale?`): classes `is-outside`, `is-today`,
  `is-selected`; a click selects it and browses to its month
- `CalendarExample` – the parts composed, with a Sunday/Monday toggle

All labels are formatted in the units' time zone (`units.timeZone`).

The parts ship scoped styles in one stylesheet; import it once:

```ts
import "minuta-vue/style.css";
```

## Development

```bash
npm run dev --workspace=minuta-vue
npm test --workspace=minuta-vue
npm run type-check --workspace=minuta-vue
```

## License

Apache 2.0 © Aleksej Dix
