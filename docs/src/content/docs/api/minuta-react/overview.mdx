---
title: minuta-react
description: React hooks and calendar components on top of the minuta core.
sidebar:
  order: 0
  label: Overview
---

`minuta-react` connects [minuta](../../minuta/divide/) to React. It keeps the
period you are looking at (for example "March 2026") in React state, and it
ships calendar components you can put together like building blocks.

## Install

```sh
npm install minuta minuta-react
```

`minuta-react` needs React 18 (`react` is a peer dependency).

## How it is built

There are three layers, each one small:

1. **The minuta core** does the date math. It is plain functions with no
   state: `period`, `next`, `divide`, … See [divide](../../minuta/divide/).
2. **A hook and a root.** [`useMinuta`](../use-minuta/) binds every core
   function to your units and keeps the _browsed period_ in state.
   [`MinutaRoot`](../minuta-root/) calls that hook once and shares the result
   with every component below it. Children read it with
   [`useMinutaContext`](../use-minuta-context/) or
   [`usePeriod`](../use-period/).
3. **Calendar parts.** [`CalendarRoot`](../calendar-root/) is a `MinutaRoot`
   that browses months and also remembers the selected and the focused day.
   [`CalendarHeader`](../calendar-header/), [`CalendarGrid`](../calendar-grid/),
   [`CalendarWeekdays`](../calendar-weekdays/) and
   [`CalendarDay`](../calendar-day/) read that state. You choose which parts
   to render and where.

The calendar parts render plain HTML with class names and no styles. You
write the CSS.

## Example

A month calendar. Clicking a day (or pressing Enter on it) selects it, and the
text below the grid shows the chosen date.

```jsx
import { useState } from "react";
import {
  CalendarGrid,
  CalendarHeader,
  CalendarRoot,
} from "minuta-react/components";

export function DatePicker() {
  const [picked, setPicked] = useState();

  return (
    <CalendarRoot onSelect={(day) => setPicked(day.start)}>
      <CalendarHeader />
      <CalendarGrid />
      <p>{picked ? picked.toDateString() : "Pick a day"}</p>
    </CalendarRoot>
  );
}
```

This renders the current month with "← Previous" and "Next →" buttons, a row
of weekday names starting on Monday, and 6 weeks of days. `day` is a
[period](../../minuta/period/): `day.start` is midnight at the start of the
chosen day.

## Exports

From `minuta-react`:

| Export                                       | What it is                                                                |
| -------------------------------------------- | ------------------------------------------------------------------------- |
| [`useMinuta`](../use-minuta/)                | Hook: every minuta function bound to your units, plus the browsed period. |
| [`MinutaRoot`](../minuta-root/)              | Component: runs `useMinuta` once and shares it with its children.         |
| [`useMinutaContext`](../use-minuta-context/) | Hook: reads the state of the closest `MinutaRoot`.                        |
| [`usePeriod`](../use-period/)                | Hook: the year, week, day, … that contains the browsed period's start.    |
| [`CalendarExample`](../calendar-example/)    | Component: a ready-made month calendar with a week start toggle.          |

From `minuta-react/components`:

| Export                                      | What it is                                                         |
| ------------------------------------------- | ------------------------------------------------------------------ |
| [`CalendarRoot`](../calendar-root/)         | Holds the calendar state: browsed month, selected and focused day. |
| [`CalendarHeader`](../calendar-header/)     | The month name between "previous" and "next" buttons.              |
| [`CalendarGrid`](../calendar-grid/)         | The month as a table of 6 weeks, with keyboard navigation.         |
| [`CalendarWeekdays`](../calendar-weekdays/) | The row of weekday names above the grid.                           |
| [`CalendarDay`](../calendar-day/)           | One day button.                                                    |
| [`CalendarExample`](../calendar-example/)   | The same ready-made calendar as above.                             |

`minuta-react/types` exports the TypeScript types only.

## Related

- [Periods and units](../../../concepts/periods-and-units/) — what a period is.
- [minuta-vue](../../minuta-vue/overview/) — the same design for Vue.
