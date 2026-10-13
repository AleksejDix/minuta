---
title: isWeekendWith
description: Check whether a period lies completely on weekend days — Saturday and Sunday, or the weekend you set.
---

Check whether a period lies completely on weekend days. The weekend is
Saturday and Sunday unless you set other days in the units.

```ts
import { isWeekendWith } from "minuta/calendar";
```

```ts
isWeekendWith(units, period);
```

## Example

```ts
import { isWeekendWith } from "minuta/calendar";
import { nativeUnits } from "minuta/native";
import { period } from "minuta";

const units = nativeUnits();

isWeekendWith(units, period(new Date(2026, 2, 21), "day")); // → true  (a Saturday)
isWeekendWith(units, period(new Date(2026, 2, 18), "day")); // → false (a Wednesday)
```

## Parameters

| Name     | What it is                                                                                            |
| -------- | ----------------------------------------------------------------------------------------------------- |
| `units`  | The units to compute with, e.g. `nativeUnits()`. They carry the weekend days. Needs `day` and `week`. |
| `period` | The period to check: a day, an hour, a range of days, …                                               |

## Returns

`true` when every day the period touches is a weekend day, otherwise
`false`.

## Another weekend

Not every country rests on Saturday and Sunday. Set the weekend when you
create the units. Days are named in lowercase English; the numbers of
`Date#getDay()` work too (0 = Sunday … 6 = Saturday).

```ts
const units = nativeUnits({ weekend: ["friday", "saturday"] });

isWeekendWith(units, period(new Date(2026, 2, 20), "day")); // → true  (a Friday)
isWeekendWith(units, period(new Date(2026, 2, 22), "day")); // → false (a Sunday)
```

With `weekend: []` there is no weekend, and `isWeekendWith` is always
`false`.

## Periods longer than a day

The check looks at every day the period touches, even partly. All of them
must be weekend days.

```ts
import { range } from "minuta";

const units = nativeUnits();

// Sat Mar 21 00:00 – Sun Mar 22 23:00
isWeekendWith(units, range(new Date(2026, 2, 21), new Date(2026, 2, 22, 23)));
// → true

// Fri Mar 20 18:00 – Sat Mar 21 10:00: Friday is not weekend
isWeekendWith(
  units,
  range(new Date(2026, 2, 20, 18), new Date(2026, 2, 21, 10))
);
// → false

isWeekendWith(units, period(new Date(2026, 2, 18), "week")); // → false
isWeekendWith(units, period(new Date(2026, 2, 21, 10), "hour")); // → true (Saturday 10:00)
```

A period that has both weekend days and working days is neither: both
`isWeekendWith` and [`isWeekdayWith`](../is-weekday-with/) return `false`
for it.

## Time zones

Which day it is depends on the time zone. The check uses the zone of the
`units`, not the zone of the computer. 22:00 UTC on Friday Mar 20 2026 is
already Saturday morning in Tokyo:

```ts
import { dateFnsTzUnits } from "minuta/date-fns-tz";
import { periodWith } from "minuta/core";

const tokyo = dateFnsTzUnits({ timeZone: "Asia/Tokyo" });
const moment = new Date("2026-03-20T22:00:00Z");

isWeekendWith(tokyo, periodWith(tokyo, moment, "day")); // → true  (Saturday in Tokyo)
isWeekendWith(nativeUnits(), period(moment, "day")); // → false (Friday 23:00 in Zurich)
```

## Errors

`isWeekendWith` throws a `RangeError` starting with `UNIT_NOT_SUPPORTED`
when `units` has no `day` or `week`. It does not check the dates of the
period: pass a valid period, e.g. one from `period()`.

## Related

- [`isWeekdayWith`](../is-weekday-with/) — the opposite check: only working days.
- [`calendar`](../calendar/) — use it as `time.isWeekend(period)` with `withUnits`.
- [`monthGridWith`](../month-grid-with/) — the days to mark in a month view.
- [Weeks and calendars](../../../concepts/weeks-and-calendars/) — week start
  and weekend explained.
