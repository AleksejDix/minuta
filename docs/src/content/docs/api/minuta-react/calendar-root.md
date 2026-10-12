---
title: CalendarRoot
description: The React component that holds the state of a month calendar — the browsed month, the selected day and the focused day.
---

The component that holds the state of a month calendar: the browsed month,
the selected day and the focused day. Put the other calendar parts inside it.

```js
import { CalendarRoot } from "minuta-react/components";
```

```jsx
<CalendarRoot onSelect={(day) => …}>
  <CalendarHeader />
  <CalendarGrid />
</CalendarRoot>
```

## Example

A calendar that starts on Sunday, blocks weekends and logs the chosen date.

```jsx
import {
  CalendarGrid,
  CalendarHeader,
  CalendarRoot,
} from "minuta-react/components";
import { isWeekendWith } from "minuta/calendar";
import { nativeUnits } from "minuta/native";

const sundayFirst = nativeUnits({ weekStartsOn: "sunday" });

export function BookingCalendar() {
  return (
    <CalendarRoot
      units={sundayFirst}
      date={new Date(2024, 0, 15)}
      isDisabled={(day) => isWeekendWith(sundayFirst, day)}
      onSelect={(day) => console.log(day.start)}
    >
      <CalendarHeader />
      <CalendarGrid />
    </CalendarRoot>
  );
}
```

It shows January 2024 with Sunday as the first column. Saturdays and Sundays
get the class `is-disabled` and can't be selected. Clicking a weekday logs the
`Date` at midnight of that day.

## Props

| Name         | What it is                                                                      | Default                       |
| ------------ | ------------------------------------------------------------------------------- | ----------------------------- |
| `units`      | The units of the calendar. The week start comes from here.                      | `nativeUnits()`, Monday weeks |
| `date`       | The date whose month is shown first. Read only once, on the first render.       | today                         |
| `isDisabled` | A function that gets a day and returns `true` when that day can't be selected.  | no day is disabled            |
| `onSelect`   | Called with the day [period](../../minuta/period/) when the user selects a day. | —                             |
| `children`   | The calendar parts and anything else you want inside the calendar.              | —                             |

Create `units` once, outside the component or with `useMemo`. A new units
object on every render rebinds every function on every render.

## Selecting a day

A day is selected by a click on its [`CalendarDay`](../calendar-day/), or by
Enter or Space while it has focus. Selecting a day:

1. marks it as selected (class `is-selected`, `aria-selected` on its cell),
2. browses to its month — selecting a grey day of the next month shows the
   next month,
3. calls `onSelect(day)`.

Moving the focus with the arrow keys does not select anything. `onSelect` is
only called on click, Enter or Space.

A disabled day stays focusable and gets the keyboard focus position when
clicked, but nothing is selected and `onSelect` is not called.

The selection lives inside `CalendarRoot`. There is no prop to set or clear
the selected day from outside; keep your own copy from `onSelect` if you need
it.

## What it renders

`CalendarRoot` is a [`MinutaRoot`](../minuta-root/) that browses months, so
[`useMinutaContext`](../use-minuta-context/) and
[`usePeriod`](../use-period/) work inside it. It wraps its children in
`<section class="calendar-shell">`.

## Related

- [`CalendarHeader`](../calendar-header/) — month name and previous/next buttons.
- [`CalendarGrid`](../calendar-grid/) — the days, with keyboard navigation.
- [`CalendarDay`](../calendar-day/) — one day button.
- [`CalendarExample`](../calendar-example/) — all parts put together.
- [`MinutaRoot`](../minuta-root/) — the general root for any unit.
