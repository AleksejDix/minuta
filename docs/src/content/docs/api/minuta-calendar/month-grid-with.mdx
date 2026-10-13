---
title: monthGridWith
description: Build the days of a month view — always 6 weeks of 7 days, starting on your week start.
---

Build the days of a month view for a calendar: always 6 weeks of 7 days,
starting on the first day of your week.

```ts
import { monthGridWith } from "minuta/calendar";
```

```ts
monthGridWith(units, date);
```

## Example

```ts
import { monthGridWith } from "minuta/calendar";
import { nativeUnits } from "minuta/native";

const grid = monthGridWith(nativeUnits(), new Date(2026, 2, 15));

grid.periods.length; // → 42
grid.periods[0]; // → Mon Feb 23 2026, a whole day (unit "day")
grid.periods[41]; // → Sun Apr 5 2026
grid.monthStart; // → Sun Mar 1 2026 00:00
grid.weekStartsOn; // → 1 (Monday)
```

Laid out in rows of 7, March 2026 looks like this:

```
Mo Tu We Th Fr Sa Su
23 24 25 26 27 28  1
 2  3  4  5  6  7  8
 9 10 11 12 13 14 15
16 17 18 19 20 21 22
23 24 25 26 27 28 29
30 31  1  2  3  4  5
```

## Parameters

| Name    | What it is                                                                                                                      |
| ------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `units` | The units to compute with, e.g. `nativeUnits()`. They decide the week start and the time zone. Needs `month`, `week` and `day`. |
| `date`  | Any moment inside the month you want. Mar 15 and Mar 31 give the same grid.                                                     |

## Returns

An object with three fields:

- `periods` — 42 day periods (6 weeks of 7 days), in order, row by row. Each
  is a whole day with the unit `"day"`.
- `monthStart` — the first moment of the month, e.g. Mar 1 00:00.
- `weekStartsOn` — the first day of the week as a number: 0 = Sunday,
  1 = Monday … 6 = Saturday.

To get the rows, cut `periods` into pieces of 7:

```ts
const weeks = [];
for (let i = 0; i < 42; i += 7) weeks.push(grid.periods.slice(i, i + 7));
// → 6 arrays of 7 days
```

## Always 42 days

The grid has 42 days for every month, even when 5 rows would do. A month
view built from it never changes height when the user goes to the next
month, so the layout does not jump.

February 2021 has 28 days and starts on a Monday. It fills exactly 4 rows,
and the grid adds 2 more rows from March:

```ts
const feb = monthGridWith(nativeUnits(), new Date(2021, 1, 10));

feb.periods[0]; // → Mon Feb 1 2021 (no days from January)
feb.periods[41]; // → Sun Mar 14 2021 (the last 2 rows are all March)
```

## Days outside the month

The first row usually starts in the previous month, and the last rows end in
the next one. These are often shown greyed out. In the March 2026 grid, 11 of
the 42 days are not in March.

To find them, check each day against the month with `contains`:

```ts
import { contains, periodWith } from "minuta/core";

const units = nativeUnits();
const grid = monthGridWith(units, new Date(2026, 2, 15));
const month = periodWith(units, grid.monthStart, "month");

grid.periods.filter((day) => !contains(month, day)).length;
// → 11
```

`contains` works in the units' own time zone. `day.start.getMonth()` reads
the month in the computer's time zone, which is wrong for units such as
`dateFnsTzUnits({ timeZone: "Asia/Tokyo" })`.

## Week start

The grid starts on the first day of the week of the `units`. It is Monday
unless you choose another day:

```ts
const sunday = monthGridWith(
  nativeUnits({ weekStartsOn: "sunday" }),
  new Date(2026, 2, 15)
);

sunday.periods[0]; // → Sun Mar 1 2026 (March starts on a Sunday)
sunday.periods[41]; // → Sat Apr 11 2026
sunday.weekStartsOn; // → 0
```

The weekend does not change the grid. Use
[`isWeekendWith`](../is-weekend-with/) to mark weekend days.

## Days are real days

Each period is one calendar day, from its first to its last millisecond. On
the day the clocks change, that day is 23 or 25 hours long. In Europe/Zurich,
Oct 25 2026 runs from 00:00 summer time to 23:59:59.999 winter time.

## Errors

`monthGridWith` throws a `RangeError` whose message starts with a code:

| Code                 | When                                                |
| -------------------- | --------------------------------------------------- |
| `INVALID_DATE`       | `date` is an invalid Date, e.g. `new Date("nope")`. |
| `UNIT_NOT_SUPPORTED` | `units` has no `month`, `week` or `day`.            |

```ts
monthGridWith(nativeUnits(), new Date("nope"));
// RangeError: INVALID_DATE: date is an invalid Date. …
```

## Related

- [`yearGridWith`](../year-grid-with/) — the whole weeks of a year.
- [`dayGridWith`](../day-grid-with/) — the hours of a day.
- [`isWeekendWith`](../is-weekend-with/) — mark the weekend days of the grid.
- [`calendar`](../calendar/) — use it as `time.monthGrid(date)` with `withUnits`.
- [`divide`](../../minuta/divide/) — split a month into its days without the
  extra days around it.
- [Weeks and calendars](../../../concepts/weeks-and-calendars/) — week start,
  weekend and grids explained.
