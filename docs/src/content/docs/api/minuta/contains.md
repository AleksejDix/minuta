---
title: contains
description: Check whether a date, or a whole other period, lies inside a period.
---

Check whether a date, or a whole other period, lies inside a period: is this
appointment in March, is this day in this week.

```ts
import { contains } from "minuta";
```

```ts
contains(period, target);
```

## Example

```ts
import { contains, period } from "minuta";

const march = period(new Date(2026, 2, 1), "month");

contains(march, new Date(2026, 2, 20));
// → true

contains(march, period(new Date(2026, 3, 1), "day"));
// → false, Apr 1 is outside March
```

## Parameters

| Name     | What it is                                     |
| -------- | ---------------------------------------------- |
| `period` | The outer period.                              |
| `target` | What to look for: a `Date`, or another period. |

## Returns

`true` or `false`.

- For a date: `true` when the date is between `period.start` and
  `period.end`, both included.
- For a period: `true` only when the _whole_ target lies inside. A target that
  sticks out on either side gives `false`, even if most of it is inside. Use
  [`overlaps`](../overlaps/) to ask "do they share any time?".

A period contains itself.

## Both edges are included

`start` and `end` are part of the period, so its first and last millisecond
count. The next millisecond does not:

```ts
contains(march, march.start); // → true
contains(march, march.end); // → true, Mar 31 23:59:59.999
contains(march, new Date(2026, 3, 1)); // → false, Apr 1 00:00:00.000
```

## Partly inside is not inside

The week from Mon Mar 30 to Sun Apr 5 starts in March but ends in April:

```ts
import { contains, overlaps, period } from "minuta";

const week = period(new Date(2026, 2, 31), "week");

contains(march, week); // → false
overlaps(march, week); // → true
```

## The unit does not matter

`contains` only compares times. It works the same for months, custom
[`range`](../range/)s and pieces from [`divide`](../divide/), and it needs no
units, so it works with every date engine.

## Errors

`contains` throws a `RangeError` whose message starts with a code:

| Code           | When                           |
| -------------- | ------------------------------ |
| `INVALID_DATE` | `target` is an invalid `Date`. |

```ts
contains(march, new Date("nope"));
// RangeError: INVALID_DATE: target is an invalid Date. …
```

A target _period_ with invalid dates is not checked; it gives `false`.

## Related

- [`overlaps`](../overlaps/) — do two periods share any time?
- [`same`](../same/) — are two periods in the same day, week, month …?
- Also exported from [`minuta/core`](../../minuta-core/overview/).
