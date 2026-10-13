---
title: CalendarGrid
description: A Vue component that renders the browsed month as a table of 6 weeks, with weekday headers and keyboard navigation.
---

A component that renders the browsed month as a table: a row of weekday names,
then 6 weeks of 7 days. It follows the WAI-ARIA date picker grid, so the
keyboard works the way screen reader users expect.

```js
import { CalendarGrid } from "minuta-vue/components";
```

```vue
<CalendarGrid locale="en-US" />
```

## Example

The default grid, and a grid that renders each day itself through the `#day`
slot.

```vue
<script setup>
import {
  CalendarDay,
  CalendarGrid,
  CalendarHeader,
  CalendarRoot,
} from "minuta-vue/components";

const { busyDays } = defineProps(["busyDays"]);
</script>

<template>
  <CalendarRoot>
    <CalendarHeader />
    <CalendarGrid />
  </CalendarRoot>

  <CalendarRoot>
    <CalendarHeader />
    <CalendarGrid>
      <template #day="{ day }">
        <CalendarDay :day="day" />
        <span v-if="busyDays.has(day.start.toDateString())" class="dot" />
      </template>
    </CalendarGrid>
  </CalendarRoot>
</template>
```

Both show the current month. The second adds a dot under every day whose date
is in the `busyDays` set.

## Props

| Name     | What it is                                                        | Default   |
| -------- | ----------------------------------------------------------------- | --------- |
| `locale` | The language of the weekday names and of the default day buttons. | `"en-US"` |

## Slots

| Slot  | What it is                                                                                                                                       |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `day` | Renders the content of one cell. Gets `{ day }`, the day [period](../../minuta/period/). Default: `<CalendarDay :day="day" :locale="locale" />`. |

When you use the `#day` slot, `locale` only changes the weekday names. Pass
the locale to your own `CalendarDay` too.

:::caution
The keyboard navigation lives in [`CalendarDay`](../calendar-day/). If your
`#day` slot does not render a `CalendarDay`, the arrow keys do nothing.
:::

## Always 42 days

The grid always has 6 rows of 7 days, even when the month fits in 4 or 5
weeks, so the calendar does not jump in height. The first row is the week that
contains the 1st of the month. Days before and after the month fill the
rest and get the class `is-outside`.

The column order comes from the units: Monday first by default,
Sunday first with `nativeUnits({ weekStartsOn: "sunday" })`. The weekday row is
a [`CalendarWeekdays`](../calendar-weekdays/), rendered for you.

## Keyboard

Only one day is in the tab order (roving focus). Tab moves into the grid on:
the last focused day of the browsed month, else the selected day, else today,
else the 1st of the month.

| Key                     | Moves the focus to                                   |
| ----------------------- | ---------------------------------------------------- |
| ArrowLeft / ArrowRight  | the previous / next day                              |
| ArrowUp / ArrowDown     | the same weekday one week earlier / later            |
| Home / End              | the first / last day of the week (units' week start) |
| PageUp / PageDown       | the same day one month earlier / later               |
| Shift+PageUp / PageDown | the same day one year earlier / later                |
| Enter / Space           | selects the focused day                              |

When the target day is outside the browsed month, the grid browses to its
month first and then focuses it. When the target month is shorter, the day is
clamped to its last day: PageDown on January 31, 2024 goes to February 29.

## Accessibility

- The table has `role="grid"` and is labelled by the month heading of
  [`CalendarHeader`](../calendar-header/) (`aria-labelledby`).
- Each cell has `aria-selected`, `true` only for the selected day.
- Weekday headers are `<th scope="col">` with the full weekday name in
  `abbr`.

## What it renders

```html
<table
  class="calendar-grid"
  role="grid"
  aria-labelledby="…"
  data-testid="calendar-grid"
>
  <thead class="calendar-weekdays">
    …
  </thead>
  <tbody>
    <tr>
      <td class="calendar-cell" aria-selected="false">…day…</td>
      …
    </tr>
    …
  </tbody>
</table>
```

## Errors

Outside a [`CalendarRoot`](../calendar-root/) — even inside a plain
`MinutaRoot` — it throws `Calendar parts must be used within <CalendarRoot>`.

## Related

- [`CalendarDay`](../calendar-day/) — the default day in each cell.
- [`CalendarWeekdays`](../calendar-weekdays/) — the weekday row.
- [`CalendarRoot`](../calendar-root/) — holds the browsed month and the selection.
- `monthGridWith` (`minuta/calendar`) — the 42 days, without Vue.
