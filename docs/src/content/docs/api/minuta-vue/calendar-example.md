---
title: CalendarExample
description: A ready-made Vue month calendar built from the calendar parts, with a toggle for the first day of the week.
---

A ready-made month calendar, built from the calendar parts, with a toggle that
switches the first day of the week between Sunday and Monday. Use it to try
the library, or read it as a template for your own calendar.

```js
import { CalendarExample } from "minuta-vue/components";
// also exported from "minuta-vue"
```

```vue
<CalendarExample @select="onSelect" />
```

## Example

```vue
<script setup>
import { CalendarExample } from "minuta-vue";
import "minuta-vue/style.css";

function onSelect(day) {
  alert(day.start.toDateString());
}
</script>

<template>
  <CalendarExample @select="onSelect" />
</template>
```

It renders a title ("minuta-vue calendar"), a "Week starts on" toggle with
"Sunday" and "Monday" buttons, a [`CalendarHeader`](../calendar-header/) and a
[`CalendarGrid`](../calendar-grid/) for the current month. Clicking a day
shows its date.

## Props, events and slots

It has no props and no slots.

| Event    | When                                                                           |
| -------- | ------------------------------------------------------------------------------ |
| `select` | The user selects a day. The payload is the day [period](../../minuta/period/). |

## How it works

It is a [`CalendarRoot`](../calendar-root/) with a header and a grid inside.
The week starts on Monday. The toggle builds new units with
`nativeUnits({ weekStartsOn })` and passes them to the root, so the weekday
row and the weeks move at once. The browsed month and the selection are kept.

The toggle buttons have `aria-pressed`, `true` on the active one, which also
gets the class `is-active`. The component's own styles (a white card with a
shadow) are in `minuta-vue/style.css`.

## Related

- [`CalendarRoot`](../calendar-root/), [`CalendarHeader`](../calendar-header/),
  [`CalendarGrid`](../calendar-grid/) — the parts it is made of.
- [Overview](../overview/) — a smaller calendar to start from.
