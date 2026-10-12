---
title: useMinuta
description: A Vue composable that binds every minuta function to your units and keeps the browsed period reactive.
---

A composable that gives you every minuta function bound to your units, plus a
_browsed period_ — the month (or week, day, …) the user is looking at — as
reactive state.

```js
import { useMinuta } from "minuta-vue";
```

```js
useMinuta({ date, now, unit, units });
```

## Example

A button that shows the browsed month and moves to the next month on click.

```vue
<script setup>
import { useMinuta } from "minuta-vue";

const minuta = useMinuta({ unit: "month" });
</script>

<template>
  <button @click="minuta.browse(minuta.next(minuta.browsing.value))">
    {{ minuta.browsing.value.start.toDateString() }}
  </button>
</template>
```

The first render shows the first day of the current month, for example
"Sun Mar 01 2026". Each click shows the first day of the next month.

`browsing` is a computed ref inside an object, so the template needs
`.value` too. Vue only unwraps refs at the top level of `<script setup>`.

## Options

All options are optional. You can call `useMinuta()` with nothing.

| Name    | What it is                                                                | Default                       |
| ------- | ------------------------------------------------------------------------- | ----------------------------- |
| `date`  | The date to browse first. Read only once.                                 | now                           |
| `now`   | The moment that counts as "now". Pass it to fix "today", e.g. in tests.   | the clock                     |
| `unit`  | The size of the browsed period: `"month"`, `"week"`, `"day"`, `"year"`, … | `"month"`                     |
| `units` | The units every function uses. The week start lives here.                 | `nativeUnits()`, Monday weeks |

You can pass the options in three ways:

- a plain object: `useMinuta({ unit: "week" })` — read once;
- a ref holding the object;
- a getter: `useMinuta(() => ({ units: units.value, unit: props.unit }))`.

With a ref or a getter, `units`, `unit` and `now` stay reactive: change them
and everything that depends on them updates. `date` is always only the start;
changing it later does not move the browsed period. Call `browse()` for that.

```js
import { shallowRef } from "vue";
import { nativeUnits } from "minuta/native";

const units = shallowRef(nativeUnits());
const minuta = useMinuta(() => ({ units: units.value }));

units.value = nativeUnits({ weekStartsOn: "sunday" }); // weeks now start on Sunday
```

## Returns

An object with reactive state and every bound function.

| Name       | What it is                                                                                     |
| ---------- | ---------------------------------------------------------------------------------------------- |
| `browsing` | Computed ref. The browsed period, in `unit`. Starts as the period containing `date`.           |
| `browse`   | `browse(period)` moves to the period of `unit` that contains `period.start`.                   |
| `now`      | Computed ref. "Now" as a one-second period. `now.value.start` is the moment.                   |
| `units`    | Computed ref. The units the functions are bound to.                                            |
| `period`   | `period(date, unit)` — the period of `unit` that contains `date`.                              |
| `next`     | `next(period)` — the period right after it, same unit.                                         |
| `previous` | `previous(period)` — the period right before it, same unit.                                    |
| `shift`    | `shift(period, steps)` — move a period by whole units, back with a negative number.            |
| `divide`   | `divide(period, unit)` — split a period into smaller ones. See [divide](../../minuta/divide/). |
| `duration` | `duration(period, unit)` — how many whole units fit into a period.                             |
| `contains` | `contains(period, dateOrPeriod)` — whether it lies fully inside the period.                    |
| `same`     | `same(a, b, unit)` — whether two periods fall into the same `unit`.                            |
| `overlaps` | `overlaps(a, b)` — whether two periods share any time.                                         |
| `range`    | `range(start, end)` — a custom period between two dates.                                       |
| `length`   | `length(period)` — the length of a period in milliseconds.                                     |

The functions are the core functions without the units argument. When the
units change, `minuta.period`, `minuta.next`, … use the new units.

:::caution
Read the functions from the object when the units can change:
`minuta.period(date, "week")`. A destructured function,
`const { period } = minuta`, keeps the units it had when you destructured it.
:::

## "Today" stays correct

Without a `now` option, the composable reads the clock once and sets a timer
for the start of the next day (in the units' days). When it fires, `now` moves
to the new day, so a calendar left open overnight marks the right day as
today. Call `useMinuta` inside `setup`: the timer stops when the component
unmounts.

With a `now` option, no timer runs. `now` follows the value you pass.

## Related

- [`MinutaRoot`](../minuta-root/) — run this composable once and share it with children.
- [`usePeriod`](../use-period/) — a period derived from the browsed one.
- [period](../../minuta/period/) — what a period is.
- [divide](../../minuta/divide/) — split a period into smaller ones.
