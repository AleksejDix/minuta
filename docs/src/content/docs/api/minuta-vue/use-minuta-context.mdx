---
title: useMinutaContext
description: A Vue composable that reads the minuta state of the nearest MinutaRoot.
---

A composable that reads the minuta state of the nearest
[`MinutaRoot`](../minuta-root/) (or [`CalendarRoot`](../calendar-root/))
above the component.

```js
import { useMinutaContext } from "minuta-vue";
```

```js
const minuta = useMinutaContext();
```

## Example

A label that shows the browsed month and how many days it has.

```vue
<!-- MonthInfo.vue -->
<script setup>
import { computed } from "vue";
import { useMinutaContext } from "minuta-vue";

const minuta = useMinutaContext();
const name = computed(() =>
  minuta.browsing.value.start.toLocaleDateString("en-US", { month: "long" })
);
const days = computed(() => minuta.divide(minuta.browsing.value, "day").length);
</script>

<template>
  <p>{{ name }} has {{ days }} days</p>
</template>
```

```vue
<MinutaRoot :date="new Date(2024, 1, 10)">
  <MonthInfo />
</MinutaRoot>
```

This renders "February has 29 days" (2024 is a leap year).

## Returns

The same object that [`useMinuta`](../use-minuta/#returns) returns:
`browsing`, `now` and `units` as computed refs, `browse`, and every bound
function (`period`, `next`, `previous`, `shift`, `divide`, …).

Every component that calls `useMinutaContext()` under the same root gets the
same object. When one of them calls `browse()`, everything that reads
`browsing` updates.

:::caution
Keep the object and read the functions from it (`minuta.next(…)`) when the
root's units can change. A destructured function keeps the old units. See
[useMinuta](../use-minuta/#returns).
:::

## Errors

It uses Vue's `inject`, so call it in `setup`. Outside a `MinutaRoot` (or
outside any component) it throws an `Error`:

```text
useMinutaContext() must be used within <MinutaRoot>
```

Inside a component, Vue also prints a `[Vue warn]` about the error thrown in
`setup`.

## Related

- [`MinutaRoot`](../minuta-root/) — provides the state.
- [`useMinuta`](../use-minuta/) — what the state contains.
- [`usePeriod`](../use-period/) — a shortcut for one derived period.
