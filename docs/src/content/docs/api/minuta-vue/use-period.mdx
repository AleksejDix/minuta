---
title: usePeriod
description: A Vue composable that returns the year, week, day or other period that contains the start of the browsed period.
---

A composable that returns, as a computed ref, the period of a given unit — a
year, a week, a day, … — that contains the start of the browsed period of the
nearest [`MinutaRoot`](../minuta-root/).

```js
import { usePeriod } from "minuta-vue";
```

```js
const year = usePeriod("year");
```

## Example

While the root browses months, show the year and the first week of the
browsed month.

```vue
<!-- Context.vue -->
<script setup>
import { usePeriod } from "minuta-vue";

const year = usePeriod("year");
const week = usePeriod("week");
</script>

<template>
  <p>
    Year {{ year.start.getFullYear() }}, first week starts
    {{ week.start.toDateString() }}
  </p>
</template>
```

```vue
<MinutaRoot unit="month" :date="new Date(2024, 2, 13)">
  <Context />
</MinutaRoot>
```

This renders "Year 2024, first week starts Mon Feb 26 2024": March 1, 2024 is
a Friday, and its week starts on the Monday before.

## Parameters

| Name   | What it is                                                                                         |
| ------ | -------------------------------------------------------------------------------------------------- |
| `unit` | The unit of the period you want: `"year"`, `"week"`, `"day"`, … Also a ref or a getter holding it. |

```js
import { ref } from "vue";

const unit = ref("week");
const current = usePeriod(unit);

unit.value = "day"; // current now holds the day
```

## Returns

A computed ref of a [period](../../minuta/period/) of `unit` that contains
`browsing.value.start`. In `<script>` read it with `.value`; in the template
Vue unwraps it for you.

It uses the root's units, so `"week"` follows the root's week start.

## When it updates

The value changes when the root browses somewhere else, when the root's units
change, or when a reactive `unit` changes.

## Errors

Outside a `MinutaRoot` it throws the error of
[`useMinutaContext`](../use-minuta-context/#errors):
`useMinutaContext() must be used within <MinutaRoot>`.

## Related

- [`useMinutaContext`](../use-minuta-context/) — the whole state.
- [`MinutaRoot`](../minuta-root/) — provides the browsed period.
- [period](../../minuta/period/) — what a period is.
