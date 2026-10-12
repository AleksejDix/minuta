---
title: calendar
description: The calendar plugin — pass it to withUnits to get monthGrid, yearGrid, dayGrid, isWeekday and isWeekend bound to your units.
---

The calendar plugin. Pass it to `withUnits` and you get the calendar
functions bound to your units, so you no longer pass the units on every
call.

```ts
import { calendar } from "minuta/calendar";
```

```ts
withUnits(units, { plugins: [calendar] });
```

## Example

```ts
import { calendar } from "minuta/calendar";
import { nativeUnits } from "minuta/native";
import { withUnits } from "minuta/core";

const time = withUnits(
  nativeUnits({ weekStartsOn: "sunday", weekend: ["friday", "saturday"] }),
  { plugins: [calendar] }
);

time.monthGrid(new Date(2026, 2, 15)).periods.length; // → 42
time.monthGrid(new Date(2026, 2, 15)).periods[0]; // → Sun Mar 1 2026
time.isWeekend(time.period(new Date(2026, 2, 20), "day")); // → true (a Friday)
time.next(time.period(new Date(2026, 2, 15), "week")); // the normal operations are there too
```

## What it contains

`calendar` is a plain object of five functions. Each takes the units first.
`withUnits` (or `bind`) fills in the units for you and drops that first
argument:

| Member      | Bound call               | The same as                                           |
| ----------- | ------------------------ | ----------------------------------------------------- |
| `monthGrid` | `time.monthGrid(date)`   | [`monthGridWith(units, date)`](../month-grid-with/)   |
| `yearGrid`  | `time.yearGrid(date)`    | [`yearGridWith(units, date)`](../year-grid-with/)     |
| `dayGrid`   | `time.dayGrid(date)`     | [`dayGridWith(units, date)`](../day-grid-with/)       |
| `isWeekday` | `time.isWeekday(period)` | [`isWeekdayWith(units, period)`](../is-weekday-with/) |
| `isWeekend` | `time.isWeekend(period)` | [`isWeekendWith(units, period)`](../is-weekend-with/) |

## Only the plugin, without the operations

`bind` from `minuta/core` binds a plugin on its own. You get only the five
calendar functions:

```ts
import { bind } from "minuta/core";

const grids = bind(nativeUnits({ weekStartsOn: "sunday" }), calendar);

grids.monthGrid(new Date(2026, 2, 15)).periods[0]; // → Sun Mar 1 2026
```

## Combining plugins

Pass several plugins in the list. Their function names must not clash with
each other or with the operations; TypeScript reports a clash as an error.
`calendar` and [`intervals`](../../minuta-intervals/intervals/) fit together:

```ts
import { intervals } from "minuta/intervals";

const time = withUnits(nativeUnits(), { plugins: [calendar, intervals] });
time.monthGrid(new Date());
time.snap(new Date(), "minute", { step: 15 });
```

## Related

- [`withUnits`](../../minuta-core/with-units/) — bind the operations and plugins to units.
- [`bind`](../../minuta-core/bind/) — bind one plugin.
- [Overview](../overview/) — everything in `minuta/calendar`.
