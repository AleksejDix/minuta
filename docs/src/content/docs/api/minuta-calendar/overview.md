---
title: minuta/calendar
description: Calendar grids for month, year and day views, and weekend checks, all following the week start and weekend of your units.
sidebar:
  order: 0
  label: Overview
---

`minuta/calendar` builds what a calendar screen needs: the days of a month
view, the weeks of a year, the hours of a day, and whether a day is on the
weekend.

```ts
import { calendar, monthGridWith } from "minuta/calendar";
```

It is a separate entry point, so it costs nothing in your bundle until you
import it.

## Functions

| Function                               | What it does                                                      |
| -------------------------------------- | ----------------------------------------------------------------- |
| [`monthGridWith`](../month-grid-with/) | The 42 days (6 weeks) of a month view.                            |
| [`yearGridWith`](../year-grid-with/)   | The whole weeks that cover a year.                                |
| [`dayGridWith`](../day-grid-with/)     | The real hours of a day: 23, 24 or 25, with the DST hours marked. |
| [`isWeekdayWith`](../is-weekday-with/) | Whether a period touches only working days.                       |
| [`isWeekendWith`](../is-weekend-with/) | Whether a period touches only weekend days.                       |
| [`calendar`](../calendar/)             | The plugin: all five, ready for `withUnits` or `bind`.            |

## Units first

Every function takes **units** as its first argument. Units are the rules
for each unit of time (year, month, week, day, hour, …), made by a date
engine such as `nativeUnits()`. They also carry three settings:

- the first day of the week (`weekStartsOn`, Monday unless set),
- the weekend days (`weekend`, Saturday and Sunday unless set),
- the time zone (`timeZone`).

The grids and checks follow these settings. A Sunday-first calendar is just
other units:

```ts
import { monthGridWith } from "minuta/calendar";
import { nativeUnits } from "minuta/native";

monthGridWith(nativeUnits(), new Date(2026, 2, 15)).periods[0];
// → Mon Feb 23 2026

monthGridWith(nativeUnits({ weekStartsOn: "sunday" }), new Date(2026, 2, 15))
  .periods[0];
// → Sun Mar 1 2026
```

## Or bind the units once

Passing the units every time gets old. Give the `calendar` plugin to
`withUnits` and call the functions without them:

```ts
import { calendar } from "minuta/calendar";
import { withUnits } from "minuta/core";

const time = withUnits(nativeUnits({ weekStartsOn: "sunday" }), {
  plugins: [calendar],
});

time.monthGrid(new Date(2026, 2, 15)); // same as monthGridWith(units, date)
time.isWeekend(time.period(new Date(2026, 2, 21), "day")); // → true
```

## Key ideas

- **Stable grids.** A month grid always has 42 days, so a month view never
  changes height. A year grid is made of whole weeks.
- **Everything is a period.** Grid cells are ordinary periods
  (`{ start, end, unit }`), so all other functions work on them.
- **Real time.** A day cell is a calendar day, even when it has 23 or 25
  hours. A day grid lists the hours that really happen.
- **Time zones come from the units.** With zone-aware units such as
  `dateFnsTzUnits({ timeZone: "Asia/Tokyo" })`, days, weekends and hours
  are those of Tokyo.

## Learn more

- [Weeks and calendars](../../../concepts/weeks-and-calendars/)
- [Time zones](../../../concepts/time-zones/)
- [Date engines](../../adapters/overview/)
