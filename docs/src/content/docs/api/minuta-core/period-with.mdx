---
title: periodWith
description: Get the whole day, week, month or year that a date falls in, computed with the units you pass.
---

Get the whole unit of time that a date falls in (its day, week, month, year),
computed with the units you pass.

```ts
import { periodWith } from "minuta/core";
```

```ts
periodWith(units, date, unit);
```

## Example

```ts
import { periodWith } from "minuta/core";
import { nativeUnits } from "minuta/native";

const units = nativeUnits({ weekStartsOn: "sunday" });

periodWith(units, new Date(2026, 2, 18), "week");
// → { start: Sun Mar 15 2026 00:00:00.000,
//     end:   Sat Mar 21 2026 23:59:59.999,
//     unit:  "week" }
```

## Parameters

| Name    | What it is                                                                                                                            |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `units` | The units to compute with, e.g. `nativeUnits()`. See [Date engines](../../../concepts/date-engines/).                                 |
| `date`  | Any `Date` inside the period you want.                                                                                                |
| `unit`  | The size of the period: `"year"`, `"quarter"`, `"month"`, `"week"`, `"day"`, `"hour"`, `"minute"`, `"second"`, or a unit of your own. |

## Returns

A period: `{ start, end, unit }`, from the first to the last millisecond of
the unit (both included). It works exactly like [`period`](../../minuta/period/),
which is `periodWith` with `nativeUnits()` bound. Read that page for the
details on every unit, local time and daylight saving.

## The units decide the rules

The same date gives different periods with different units:

```ts
import { periodWith } from "minuta/core";
import { dateFnsTzUnits } from "minuta/date-fns-tz";
import { nativeUnits } from "minuta/native";

periodWith(nativeUnits(), new Date(2026, 2, 18), "week");
// → Mon Mar 16 – Sun Mar 22 (weeks start on Monday by default)

const tokyo = dateFnsTzUnits({ timeZone: "Asia/Tokyo" });
periodWith(tokyo, new Date("2026-03-20T20:00:00Z"), "day");
// → 2026-03-20T15:00:00.000Z – 2026-03-21T14:59:59.999Z, Mar 21 in Tokyo
```

## Only the units you pass

`units` can hold just the units you use. A unit that is not there throws:

```ts
const { day, month } = nativeUnits();

periodWith({ day, month }, new Date(2026, 2, 18), "month"); // works
periodWith({ day, month }, new Date(2026, 2, 18), "week");
// RangeError: UNIT_NOT_SUPPORTED: no "week" spec in the units passed (available: day, month). …
```

## Errors

`periodWith` throws a `RangeError` whose message starts with a code:

| Code                 | When                                                     |
| -------------------- | -------------------------------------------------------- |
| `INVALID_DATE`       | `date` is an invalid `Date`, e.g. `new Date("nope")`.    |
| `UNIT_NOT_SUPPORTED` | `units` has no spec for `unit`, or `unit` is `"custom"`. |

## Related

- [`period`](../../minuta/period/) (`minuta`) — the same, ready to use.
- [`withUnits`](../with-units/) — bind the units once: `time.period(date, unit)`.
- [`range`](../../minuta/range/) — a period between any two dates.
- [`nextWith`](../next-with/) — the period after.
