---
title: period
description: Get the whole day, week, month or year that a date falls in.
---

Get the whole unit of time that a date falls in: the day of a date, its week,
its month, its year.

```ts
import { period } from "minuta";
```

```ts
period(date, unit);
```

## Example

```ts
import { period } from "minuta";

period(new Date(2026, 2, 18, 14, 35), "month");
// → { start: Sun Mar 1 2026 00:00:00.000,
//     end:   Tue Mar 31 2026 23:59:59.999,
//     unit:  "month" }

period(new Date(2026, 2, 18, 14, 35), "week");
// → Mon Mar 16 00:00:00.000 – Sun Mar 22 23:59:59.999, unit "week"
```

The date can be any moment inside the unit. Mar 1, Mar 18 at 14:35 and
Mar 31 at 23:59 all give the same month.

## Parameters

| Name   | What it is                                                                                                       |
| ------ | ---------------------------------------------------------------------------------------------------------------- |
| `date` | Any `Date` inside the period you want.                                                                           |
| `unit` | The size of the period: `"year"`, `"quarter"`, `"month"`, `"week"`, `"day"`, `"hour"`, `"minute"` or `"second"`. |

## Returns

A period: a plain object with three fields.

- `start` — the first millisecond of the unit.
- `end` — the last millisecond of the unit. The end is _inclusive_: it is part
  of the period, so a day ends at 23:59:59.999, not at midnight.
- `unit` — the unit you asked for.

`start` and `end` are new `Date` objects. Changing your `date` later does not
change the period. See [Periods and units](../../../concepts/periods-and-units/)
for the idea behind this shape.

## Every unit

For the date Wed Mar 18 2026, 14:35:20.500:

| Unit        | `start`             | `end`                   |
| ----------- | ------------------- | ----------------------- |
| `"year"`    | Thu Jan 1 00:00:00  | Thu Dec 31 23:59:59.999 |
| `"quarter"` | Thu Jan 1 00:00:00  | Tue Mar 31 23:59:59.999 |
| `"month"`   | Sun Mar 1 00:00:00  | Tue Mar 31 23:59:59.999 |
| `"week"`    | Mon Mar 16 00:00:00 | Sun Mar 22 23:59:59.999 |
| `"day"`     | Wed Mar 18 00:00:00 | Wed Mar 18 23:59:59.999 |
| `"hour"`    | Wed Mar 18 14:00:00 | Wed Mar 18 14:59:59.999 |
| `"minute"`  | Wed Mar 18 14:35:00 | Wed Mar 18 14:35:59.999 |
| `"second"`  | Wed Mar 18 14:35:20 | Wed Mar 18 14:35:20.999 |

Weeks start on Monday here (ISO 8601). To start them on Sunday, use
`periodWith` from `minuta/core` with your own units.

## Local time and daylight saving

`period` works in the local time zone of the runtime, like `new Date(2026, 2, 1)`
does. A day is the local calendar day, even when it is not 24 hours long. In
Europe/Zurich the clocks jump from 2:00 to 3:00 on Mar 29 2026:

```ts
period(new Date(2026, 2, 29, 12), "day");
// → Sun Mar 29 00:00:00.000 – Sun Mar 29 23:59:59.999, only 23 hours long
```

To compute in a fixed time zone instead, use an adapter with a `timeZone`
(see [Date engines](../../../concepts/date-engines/)).

## There is no `"custom"` unit here

`"custom"` is the unit of periods that do not match one whole unit. You cannot
ask `period` for one; use [`range`](../range/) to make a period from any two
dates.

```ts
period(new Date(), "custom");
// RangeError: UNIT_NOT_SUPPORTED: no "custom" spec in the units passed …
```

## Errors

`period` throws a `RangeError` whose message starts with a code:

| Code                 | When                                                             |
| -------------------- | ---------------------------------------------------------------- |
| `INVALID_DATE`       | `date` is an invalid `Date`, e.g. `new Date("nope")`.            |
| `UNIT_NOT_SUPPORTED` | `unit` is not one of the units listed above, e.g. `"fortnight"`. |

```ts
period(new Date("nope"), "day");
// RangeError: INVALID_DATE: date is an invalid Date. …
```

## Related

- [`range`](../range/) — a period between any two dates.
- [`next`](../next/) and [`previous`](../previous/) — the period after or before.
- [`divide`](../divide/) — split the period into smaller ones.
- [`periodWith`](../../minuta-core/period-with/) (`minuta/core`) — the same, with your own units and week start.
