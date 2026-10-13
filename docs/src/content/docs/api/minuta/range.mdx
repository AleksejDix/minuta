---
title: range
description: Make a period between any two dates, such as a meeting, a trip or a billing cycle.
---

Make a period between any two dates: a meeting from 9:00 to 10:00, a trip
from Jan 1 to Mar 31, a billing cycle.

```ts
import { range } from "minuta";
```

```ts
range(start, end);
```

## Example

```ts
import { range } from "minuta";

range(new Date(2026, 0, 1), new Date(2026, 2, 31));
// → { start: Thu Jan 1 2026 00:00:00.000,
//     end:   Tue Mar 31 2026 00:00:00.000,
//     unit:  "custom" }
```

## Parameters

| Name    | What it is                              |
| ------- | --------------------------------------- |
| `start` | One edge of the period, a `Date`.       |
| `end`   | The other edge of the period, a `Date`. |

## Returns

A period with the unit `"custom"`. `start` and `end` are the dates you passed,
unchanged. Both are part of the period: `end` is _inclusive_.

`"custom"` means "not one whole unit". See
[Periods and units](../../../concepts/periods-and-units/).

## The end is used exactly as given

`range` does not round `end` to the end of a day. `new Date(2026, 2, 31)` is
midnight at the _start_ of Mar 31, so the range above stops there and does not
include the rest of that day:

```ts
import { contains, duration, range } from "minuta";

const q1 = range(new Date(2026, 0, 1), new Date(2026, 2, 31));

contains(q1, new Date(2026, 2, 31, 12)); // → false
duration(q1, "day"); // → 89
```

To include the whole last day, end the range at the day's last millisecond.
The `end` of a day [`period`](../period/) is exactly that:

```ts
import { duration, period, range } from "minuta";

const q1 = range(
  period(new Date(2026, 0, 1), "day").start,
  period(new Date(2026, 2, 31), "day").end
);
// → Thu Jan 1 00:00:00.000 – Tue Mar 31 23:59:59.999

duration(q1, "day"); // → 90
```

:::caution
A range from 9:00 to 10:00 includes 10:00:00.000 itself, so it is one hour
and one millisecond long. It also touches a range that starts at 10:00:
[`overlaps`](../overlaps/) says `true` for the two. For back-to-back slots,
end each one at 9:59:59.999, or make them with [`divide`](../divide/), which
does this for you.
:::

## Dates in the wrong order are swapped

`range` is forgiving. If `start` is later than `end`, it swaps them:

```ts
range(new Date(2026, 2, 31), new Date(2026, 0, 1));
// → Thu Jan 1 00:00:00.000 – Tue Mar 31 00:00:00.000, unit "custom"
```

A range may also start and end at the same moment. It is then one millisecond
long.

## The dates are not copied

The period holds the very `Date` objects you passed. Do not change them
afterwards (for example with `setDate`), or the period changes with them.

## Errors

`range` throws a `RangeError` whose message starts with a code:

| Code           | When                                   |
| -------------- | -------------------------------------- |
| `INVALID_DATE` | `start` or `end` is an invalid `Date`. |

```ts
range(new Date("nope"), new Date());
// RangeError: INVALID_DATE: start is an invalid Date. …
```

## Related

- [`period`](../period/) — a whole day, week, month … instead of any two dates.
- [`divide`](../divide/) — split the range into days, hours or slots.
- [`length`](../length/) — how long the range is in milliseconds.
- [`next`](../next/) — the range of the same length right after this one.
