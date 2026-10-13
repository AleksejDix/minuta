---
title: isWeekdayWith
description: Check whether a period lies completely on working days — no Saturday, no Sunday, or no day of the weekend you set.
---

Check whether a period lies completely on working days, that is, days that
are not part of the weekend. The weekend is Saturday and Sunday unless you
set other days in the units.

```ts
import { isWeekdayWith } from "minuta/calendar";
```

```ts
isWeekdayWith(units, period);
```

## Example

```ts
import { isWeekdayWith } from "minuta/calendar";
import { nativeUnits } from "minuta/native";
import { divide, period } from "minuta";

const units = nativeUnits();

isWeekdayWith(units, period(new Date(2026, 2, 18), "day")); // → true  (a Wednesday)
isWeekdayWith(units, period(new Date(2026, 2, 21), "day")); // → false (a Saturday)

// The working days of March 2026
divide(period(new Date(2026, 2, 1), "month"), "day").filter((day) =>
  isWeekdayWith(units, day)
).length;
// → 22
```

## Parameters

| Name     | What it is                                                                                            |
| -------- | ----------------------------------------------------------------------------------------------------- |
| `units`  | The units to compute with, e.g. `nativeUnits()`. They carry the weekend days. Needs `day` and `week`. |
| `period` | The period to check: a day, an hour, a range of days, …                                               |

## Returns

`true` when no day the period touches is a weekend day, otherwise `false`.

## Another weekend

Set the weekend when you create the units. Then Sunday is a working day:

```ts
const units = nativeUnits({ weekend: ["friday", "saturday"] });

isWeekdayWith(units, period(new Date(2026, 2, 22), "day")); // → true  (a Sunday)
isWeekdayWith(units, period(new Date(2026, 2, 20), "day")); // → false (a Friday)
```

minuta knows nothing about public holidays. A holiday on a Tuesday is a
working day for `isWeekdayWith`.

## Periods longer than a day

Every day the period touches counts, even partly:

```ts
import { range } from "minuta";

const units = nativeUnits();

// Mon Mar 16 – Fri Mar 20
isWeekdayWith(
  units,
  range(new Date(2026, 2, 16), new Date(2026, 2, 20, 23, 59, 59, 999))
);
// → true

isWeekdayWith(units, period(new Date(2026, 2, 18), "week")); // → false (has Sat and Sun)
isWeekdayWith(units, period(new Date(2026, 2, 1), "month")); // → false
```

A period with both kinds of days is neither: both `isWeekdayWith` and
[`isWeekendWith`](../is-weekend-with/) return `false`.

The days are counted in the time zone of the `units`, see
[`isWeekendWith`](../is-weekend-with/#time-zones).

## Errors

`isWeekdayWith` throws a `RangeError` starting with `UNIT_NOT_SUPPORTED`
when `units` has no `day` or `week`. It does not check the dates of the
period: pass a valid period, e.g. one from `period()`.

## Related

- [`isWeekendWith`](../is-weekend-with/) — the opposite check: only weekend days.
- [`calendar`](../calendar/) — use it as `time.isWeekday(period)` with `withUnits`.
- [`divide`](../../minuta/divide/) — split a month into days to filter them.
- [Weeks and calendars](../../../concepts/weeks-and-calendars/) — weekend explained.
