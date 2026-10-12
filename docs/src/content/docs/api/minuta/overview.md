---
title: minuta
description: The main entry point — every operation, ready to use with the built-in Date and weeks that start on Monday.
sidebar:
  order: 0
  label: Overview
---

`minuta` is the main entry point. It has every operation, ready to use: no
setup, no configuration. It computes with the built-in `Date` in the local
time zone, and weeks start on Monday (ISO 8601).

```ts
import { divide, next, period } from "minuta";

const march = period(new Date(2026, 2, 15), "month");

next(march); // → April 2026
divide(march, "day"); // → 31 day periods
```

## The core idea

Every span of time is a **period**: a plain object with a `start`, an `end`
and a `unit`, like `{ start: Mar 1 00:00, end: Mar 31 23:59:59.999, unit:
"month" }`. Both ends are part of the period.

You make a period with [`period`](../period/) (a whole day, week, month …) or
[`range`](../range/) (any two dates). Then you move it, split it, measure it
or compare it. Every function takes plain data and returns new plain data;
nothing is changed in place.

Read [Periods and units](../../../concepts/periods-and-units/) for the full
picture.

## Functions

| Function                          | What it does                                                 |
| --------------------------------- | ------------------------------------------------------------ |
| [`period`](../period/)            | The whole day, week, month … that a date falls in.           |
| [`range`](../range/)              | A period between any two dates.                              |
| [`next`](../next/)                | The period right after a period.                             |
| [`previous`](../previous/)        | The period right before a period.                            |
| [`shift`](../shift/)              | Move a period forward or back by a number of its own unit.   |
| [`divide`](../divide/)            | Split a period into smaller periods: a month into days.      |
| [`contains`](../contains/)        | Is a date or another period inside a period?                 |
| [`overlaps`](../overlaps/)        | Do two periods share any time?                               |
| [`same`](../same/)                | Do two periods fall in the same day, week, month …?          |
| [`duration`](../duration/)        | How many whole units fit into a period: the days in a month. |
| [`length`](../length/)            | How long a period is, in milliseconds.                       |
| [`MinutaError`](../minuta-error/) | The codes at the start of every error message.               |

## `minuta` or `minuta/core`?

Use **`minuta`** when the built-in `Date`, the local time zone and weeks from
Monday to Sunday are what you need. That is most apps.

Use **[`minuta/core`](../../minuta-core/overview/)** when you need any of:

- weeks that start on another day, such as Sunday;
- another date library (date-fns, Luxon, Day.js, Moment, Temporal) or a fixed
  time zone;
- your own weekend days, or your own units;
- plugins such as calendar grids, bound to the same settings;
- the smallest possible bundle, with only the units you use.

`minuta/core` has the same operations. They take the units as their first
argument (`periodWith(units, date, "week")`), or you bind them once with
`withUnits`. Periods from both are the same plain objects, so you can mix
them. See [Date engines](../../../concepts/date-engines/).

```ts
import { withUnits } from "minuta/core";
import { nativeUnits } from "minuta/native";

const time = withUnits(nativeUnits({ weekStartsOn: "sunday" }));

time.period(new Date(2026, 2, 18), "week");
// → Sun Mar 15 – Sat Mar 21
```

`minuta` works like `withUnits(nativeUnits())`, but as separate functions,
so your bundler keeps only the ones you import.
