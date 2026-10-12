---
title: MinutaRoot
description: A Vue component that runs useMinuta once and provides the result to every component inside it.
---

A component that runs [`useMinuta`](../use-minuta/) once and provides the
result to every component inside it, so they all see the same browsed period.

```js
import { MinutaRoot } from "minuta-vue";
```

```vue
<MinutaRoot unit="month">…</MinutaRoot>
```

## Example

Two separate components share one state: the button moves to the next month,
and the heading shows the year of the browsed month.

```vue
<!-- Year.vue -->
<script setup>
import { usePeriod } from "minuta-vue";

const year = usePeriod("year");
</script>

<template>
  <h2>{{ year.start.getFullYear() }}</h2>
</template>
```

```vue
<!-- NextMonth.vue -->
<script setup>
import { useMinutaContext } from "minuta-vue";

const minuta = useMinutaContext();
</script>

<template>
  <button @click="minuta.browse(minuta.next(minuta.browsing.value))">
    Next
  </button>
</template>
```

```vue
<!-- App.vue -->
<script setup>
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

Clicking "Next" in December changes the heading to the next year.

## Props

The props are the options of [`useMinuta`](../use-minuta/#options).

| Name    | What it is                                               | Default                       |
| ------- | -------------------------------------------------------- | ----------------------------- |
| `date`  | The date to browse first. Read only once.                | now                           |
| `now`   | The moment that counts as "now".                         | the clock                     |
| `unit`  | The size of the browsed period.                          | `"month"`                     |
| `units` | The units every function uses, including the week start. | `nativeUnits()`, Monday weeks |

Props are reactive: a new `unit`, `units` or `now` updates every reader. A new
`date` does nothing, because `date` is only the start.

## Slot

The default slot gets the state as `minuta`, so you can use it without a
child component:

```vue
<MinutaRoot v-slot="{ minuta }">
  <p>{{ minuta.browsing.value.start.toDateString() }}</p>
</MinutaRoot>
```

`MinutaRoot` renders no element of its own, only its slot.

## Reading the state

Inside a `MinutaRoot`, read the state with
[`useMinutaContext`](../use-minuta-context/) (the whole state) or
[`usePeriod`](../use-period/) (one derived period). Both use the nearest
`MinutaRoot` above them, so you can nest roots with different units.

## Related

- [`useMinuta`](../use-minuta/) — the composable behind it, and what the state contains.
- [`useMinutaContext`](../use-minuta-context/) — read the state.
- [`usePeriod`](../use-period/) — a period derived from the browsed one.
- [`CalendarRoot`](../calendar-root/) — a `MinutaRoot` for month calendars.
