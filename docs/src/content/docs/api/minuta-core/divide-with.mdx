---
title: divideWith
description: Split a period into smaller periods — a month into weeks, a day into hours — with the units you pass.
---

Split a period into smaller periods (a month into weeks, a day into hours, an
hour into 15-minute slots), computed with the units you pass.

```ts
import { divideWith } from "minuta/core";
```

```ts
divideWith(units, period, unit, options?)
```

## Example

```ts
import { divideWith, periodWith } from "minuta/core";
import { nativeUnits } from "minuta/native";

const units = nativeUnits({ weekStartsOn: "sunday" });
const march = periodWith(units, new Date(2026, 2, 1), "month");

divideWith(units, march, "week");
// → Sun Mar 1 – Sat Mar 7    "week"
//   Sun Mar 8 – Sat Mar 14   "week"
//   Sun Mar 15 – Sat Mar 21  "week"
//   Sun Mar 22 – Sat Mar 28  "week"
//   Sun Mar 29 – Tue Mar 31  "custom"  (the week ends in April)
```

With weeks from Sunday, March 2026 starts on a whole week. With the default
Monday start, the same call gives six pieces, and the first one is cut.

## Parameters

| Name      | What it is                                                                                            |
| --------- | ----------------------------------------------------------------------------------------------------- |
| `units`   | The units to compute with, e.g. `nativeUnits()`. See [Date engines](../../../concepts/date-engines/). |
| `period`  | The period to split, e.g. a month from `periodWith()`.                                                |
| `unit`    | The size of each piece: `"day"`, `"hour"`, `"week"`, …                                                |
| `options` | Optional. `step` and `maxPeriods`, see [Options](#options) below.                                     |

## Options

| Option       | Default   | What it does                                                                           |
| ------------ | --------- | -------------------------------------------------------------------------------------- |
| `step`       | `1`       | How many units each piece spans. `{ step: 15 }` with `"minute"` gives 15-minute slots. |
| `maxPeriods` | `100_000` | A safety limit. `divideWith` throws instead of creating more pieces than this.         |

## Returns

An array of periods, in order, that together cover `period` exactly: no gaps,
no overlaps. Pieces cut at the edges of `period`, and all pieces made with a
`step` above 1, get the unit `"custom"`.

It works exactly like [`divide`](../../minuta/divide/), which is `divideWith`
with `nativeUnits()` bound. Read that page for the details on cut pieces and
steps.

## Steps count from the start of the period

Pieces with a `step` start at the beginning of `period` (rounded down to the
unit), not at round clock times:

```ts
import { divideWith, range } from "minuta/core";
import { nativeUnits } from "minuta/native";

const units = nativeUnits();

divideWith(
  units,
  range(new Date(2026, 2, 1, 9, 7), new Date(2026, 2, 1, 10)),
  "minute",
  { step: 15 }
);
// → 9:07–9:21:59.999, 9:22–9:36:59.999, 9:37–9:51:59.999, 9:52–10:00:00.000
```

## Hours follow the clock change

Hours are real elapsed hours, so a day with a clock change has fewer or more
of them. In Europe/Zurich:

```ts
import { divideWith, periodWith } from "minuta/core";
import { nativeUnits } from "minuta/native";

const units = nativeUnits();

divideWith(units, periodWith(units, new Date(2026, 2, 29), "day"), "hour")
  .length; // → 23
divideWith(units, periodWith(units, new Date(2026, 9, 25), "day"), "hour")
  .length; // → 25
```

On Oct 25 the hour from 2:00 to 3:00 comes twice, once in summer time and
once in winter time. The two pieces look the same on the wall clock but are
an hour apart (`00:00Z` and `01:00Z`).

## Errors

`divideWith` throws a `RangeError` whose message starts with a code:

| Code                 | When                                                           |
| -------------------- | -------------------------------------------------------------- |
| `TOO_MANY_PERIODS`   | More than `maxPeriods` pieces, e.g. a year split into seconds. |
| `INVALID_OPTION`     | `step` or `maxPeriods` is not a positive whole number.         |
| `UNIT_NOT_SUPPORTED` | `units` has no spec for `unit`.                                |

```ts
divideWith(units, march, "day", { step: 1.5 });
// RangeError: INVALID_OPTION: divideWith() step must be a positive whole number, got 1.5. …
```

## Related

- [`divide`](../../minuta/divide/) (`minuta`) — the same, ready to use.
- [`durationWith`](../duration-with/) — count the units without creating them.
- [`periodWith`](../period-with/) — create the period to divide.
- [`bind`](../bind/) — use `divideWith` inside a plugin of your own.
