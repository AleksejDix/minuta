---
title: CalendarRoot
description: The Vue component that holds the state of a month calendar — the browsed month, the selected day and the focused day.
---

The component that holds the state of a month calendar: the browsed month,
the selected day and the focused day. Put the other calendar parts inside it.

```js
import { CalendarRoot } from "minuta-vue/components";
```

```vue
<CalendarRoot @select="onSelect">
  <CalendarHeader />
  <CalendarGrid />
</CalendarRoot>
```

## Example

A calendar that starts on Sunday, blocks weekends and logs the chosen date.

```vue
<script setup>
import {
  CalendarGrid,
  CalendarHeader,
  CalendarRoot,
} from "minuta-vue/components";
import { isWeekendWith } from "minuta/calendar";
import { nativeUnits } from "minuta/native";
import "minuta-vue/style.css";

const sundayFirst = nativeUnits({ weekStartsOn: "sunday" });
const isWeekend = (day) => isWeekendWith(sundayFirst, day);
</script>

<template>
  <CalendarRoot
    :units="sundayFirst"
    :date="new Date(2024, 0, 15)"
    :is-disabled="isWeekend"
    @select="(day) => console.log(day.start)"
  >
    <CalendarHeader />
    <CalendarGrid />
  </CalendarRoot>
</template>
```

It shows January 2024 with Sunday as the first column. Saturdays and Sundays
get the class `is-disabled` and can't be selected. Clicking a weekday logs the
`Date` at midnight of that day.

## Props

| Name         | What it is                                                                                                          | Default                       |
| ------------ | ------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| `units`      | The units of the calendar. The week start comes from here.                                                          | `nativeUnits()`, Monday weeks |
| `date`       | The date whose month is shown first. Read only once.                                                                | today                         |
| `isDisabled` | A function that gets a day and returns `true` when that day can't be selected. Written `:is-disabled` in templates. | no day is disabled            |

`units` is reactive: pass new units and the grid rebuilds with the new week
start, keeping the browsed month and the selection.

## Events

| Event    | When                                                                           |
| -------- | ------------------------------------------------------------------------------ |
| `select` | The user selects a day. The payload is the day [period](../../minuta/period/). |

There is no `v-model`. The selection lives inside `CalendarRoot`, and there is
no prop to set or clear it from outside; keep your own copy from `@select` if
you need it.

## Slots

| Slot      | What it is                                                         |
| --------- | ------------------------------------------------------------------ |
| `default` | The calendar parts and anything else you want inside the calendar. |

## Selecting a day

A day is selected by a click on its [`CalendarDay`](../calendar-day/), or by
Enter or Space while it has focus. Selecting a day:

1. marks it as selected (class `is-selected`, `aria-selected` on its cell),
2. emits `select` with the day,
3. browses to its month — selecting a grey day of the next month shows the
   next month.

Moving the focus with the arrow keys does not select anything.

A disabled day stays focusable and becomes the focused day when clicked, but
nothing is selected and no `select` event is emitted.

## What it renders

`CalendarRoot` is a [`MinutaRoot`](../minuta-root/) that browses months, so
[`useMinutaContext`](../use-minuta-context/) and
[`usePeriod`](../use-period/) work inside it. It renders no element of its
own, only its slot.

## Related

- [`CalendarHeader`](../calendar-header/) — month name and previous/next buttons.
- [`CalendarGrid`](../calendar-grid/) — the days, with keyboard navigation.
- [`CalendarDay`](../calendar-day/) — one day button.
- [`CalendarExample`](../calendar-example/) — all parts put together.
- [`MinutaRoot`](../minuta-root/) — the general root for any unit.
