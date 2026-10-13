---
title: duration
description: Count how many whole units fit into a period — the hours in a day, the days in a month.
---

Count how many whole units fit into a period: the hours in a day, the days in
a month, the weeks in a year.

```ts
import { duration } from "minuta";
```

```ts
duration(period, unit);
```

## Example

```ts
import { duration, period } from "minuta";

duration(period(new Date(2026, 1, 1), "month"), "day");
// → 28

duration(period(new Date(2026, 9, 8), "day"), "hour");
// → 24
```

## Parameters

| Name     | What it is                                               |
| -------- | -------------------------------------------------------- |
| `period` | The period to measure, e.g. a month from `period()`.     |
| `unit`   | What to count: `"day"`, `"hour"`, `"week"`, `"month"`, … |

## Returns

A whole number: how many complete `unit`s fit from the start of `period` to
its end. Units that only partly fit are not counted.

```ts
import { duration, period, range } from "minuta";

duration(period(new Date(2026, 2, 1), "month"), "week"); // → 4  (31 days)
duration(period(new Date(2026, 2, 1), "month"), "year"); // → 0
duration(range(new Date(2026, 2, 1, 9), new Date(2026, 2, 1, 10, 30)), "hour"); // → 1
```

`duration` only counts. To get the pieces themselves, use
[`divide`](../divide/).

## Calendar units, not fixed lengths

Units are counted on the calendar, so a day is not always 24 hours and a year
is not always 365 days. In Europe/Zurich:

```ts
duration(period(new Date(2026, 2, 29), "day"), "hour"); // → 23 (clocks go forward)
duration(period(new Date(2026, 9, 25), "day"), "hour"); // → 25 (clocks go back)
duration(period(new Date(2028, 0, 1), "year"), "day"); // → 366 (leap year)
```

For a plain length in milliseconds, use [`length`](../length/).

## Counting starts at the start

Whole units are counted from `period.start`, not on unit boundaries. A
period from 14:00 one day to 13:00 the next is 23 hours, so it holds zero
whole days:

```ts
duration(range(new Date(2026, 2, 15, 14), new Date(2026, 2, 16, 13)), "day");
// → 0
```

Month steps follow the calendar too. One month after Jan 31 is Feb 28 (the
day is cut to the shorter month), so this period already holds one month:

```ts
duration(
  range(new Date(2026, 0, 31), new Date(2026, 1, 27, 23, 59, 59, 999)),
  "month"
);
// → 1
```

## The end is included

The period's `end` is its last millisecond, so `duration` measures up to one
millisecond after it. That is why a whole day counts as one day and not
"almost one". It also means a [`range`](../range/) that ends at midnight stops
at the start of its last day:

```ts
duration(range(new Date(2026, 0, 1), new Date(2026, 2, 31)), "day");
// → 89, Mar 31 itself is not included

duration(
  range(new Date(2026, 0, 1), new Date(2026, 2, 31, 23, 59, 59, 999)),
  "day"
);
// → 90
```

## Errors

`duration` throws a `RangeError` whose message starts with a code:

| Code                 | When                                            |
| -------------------- | ----------------------------------------------- |
| `UNIT_NOT_SUPPORTED` | `unit` is not a known unit, e.g. `"fortnight"`. |

## Related

- [`length`](../length/) — the length in milliseconds.
- [`divide`](../divide/) — create the pieces instead of counting them.
- [`durationWith`](../../minuta-core/duration-with/) (`minuta/core`) — the same, with your own units and week start.
