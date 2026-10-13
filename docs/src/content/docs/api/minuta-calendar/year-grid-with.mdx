---
title: yearGridWith
description: Get the whole weeks that cover a year, from the week of January 1 to the week of December 31.
---

Get the whole weeks that cover a year: from the week that contains January 1
to the week that contains December 31.

```ts
import { yearGridWith } from "minuta/calendar";
```

```ts
yearGridWith(units, date);
```

## Example

```ts
import { yearGridWith } from "minuta/calendar";
import { nativeUnits } from "minuta/native";

const grid = yearGridWith(nativeUnits(), new Date(2026, 5, 1));

grid.periods.length; // → 53
grid.periods[0]; // → Mon Dec 29 2025 – Sun Jan 4 2026 (unit "week")
grid.periods[52]; // → Mon Dec 28 2026 – Sun Jan 3 2027
grid.yearStart; // → Thu Jan 1 2026 00:00
grid.weekStartsOn; // → 1 (Monday)
```

## Parameters

| Name    | What it is                                                                                            |
| ------- | ----------------------------------------------------------------------------------------------------- |
| `units` | The units to compute with, e.g. `nativeUnits()`. They decide the week start. Needs `year` and `week`. |
| `date`  | Any moment inside the year you want.                                                                  |

## Returns

An object with three fields:

- `periods` — the weeks, in order. Each one is a whole week with the unit
  `"week"`, from the first millisecond of its first day to the last
  millisecond of its seventh day.
- `yearStart` — the first moment of the year, Jan 1 00:00.
- `weekStartsOn` — the first day of the week as a number: 0 = Sunday,
  1 = Monday … 6 = Saturday.

## Weeks stick out of the year

The weeks are never cut. The first week usually starts in December of the
year before, and the last one usually ends in January of the next year. If
you need the days of the year only, use [`divide`](../../minuta/divide/)
instead.

## 53 or 54 weeks

A year has 365 or 366 days, which is a bit more than 52 weeks. So the grid
always has at least 53 weeks. A leap year that starts on the last day of the
week needs 54:

```ts
yearGridWith(nativeUnits(), new Date(2012, 0, 1)).periods.length;
// → 54 (2012 starts on a Sunday, weeks start on Monday)

yearGridWith(nativeUnits({ weekStartsOn: "sunday" }), new Date(2012, 0, 1))
  .periods.length;
// → 53
```

Do not use the position in `periods` as a week number. The first week of the
grid is the week that contains January 1, which is not always week 1 in the
ISO 8601 system: Jan 1 2021 was a Friday, so the grid starts on Mon Dec 28
2020, which ISO counts as week 53 of 2020. minuta does not compute week
numbers.

## Week start

The weeks start on the first day of the week of the `units`, Monday unless
you choose another day:

```ts
const grid = yearGridWith(
  nativeUnits({ weekStartsOn: "sunday" }),
  new Date(2026, 5, 1)
);

grid.periods[0]; // → Sun Dec 28 2025 – Sat Jan 3 2026
grid.periods[52]; // → Sun Dec 27 2026 – Sat Jan 2 2027
```

## Errors

`yearGridWith` throws a `RangeError` whose message starts with a code:

| Code                 | When                                                |
| -------------------- | --------------------------------------------------- |
| `INVALID_DATE`       | `date` is an invalid Date, e.g. `new Date("nope")`. |
| `UNIT_NOT_SUPPORTED` | `units` has no `year` or `week`.                    |

## Related

- [`monthGridWith`](../month-grid-with/) — the 42 days of a month view.
- [`dayGridWith`](../day-grid-with/) — the hours of a day.
- [`calendar`](../calendar/) — use it as `time.yearGrid(date)` with `withUnits`.
- [Weeks and calendars](../../../concepts/weeks-and-calendars/) — week start
  and grids explained.
