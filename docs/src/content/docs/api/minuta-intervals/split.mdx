---
title: split
description: Cut a period in two at a date — the part before it and the part from it on.
---

Cut a period in two at a date: the part before that date, and the part from
that date on.

```ts
import { split } from "minuta/intervals";
```

```ts
split(period, splitDate);
```

## Example

```ts
import { split } from "minuta/intervals";
import { period } from "minuta";

const march = period(new Date(2026, 2, 1), "month");

split(march, new Date(2026, 2, 15));
// → [
//     { start: Mar 1 00:00,  end: Mar 14 23:59:59.999, unit: "custom" },
//     { start: Mar 15 00:00, end: Mar 31 23:59:59.999, unit: "custom" },
//   ]
```

## Parameters

| Name        | What it is                                             |
| ----------- | ------------------------------------------------------ |
| `period`    | The period to cut.                                     |
| `splitDate` | Where the second part starts. Must be inside `period`. |

## Returns

A pair of periods:

1. From the start of `period` to one millisecond before `splitDate`.
2. From `splitDate` to the end of `period`.

Every millisecond of `period` is in exactly one of the two. Both parts have
the unit `"custom"`: half a month is not a month.

`undefined` when `splitDate` cannot cut the period.

## Where you can cut

The split date must be after the start and not after the end:

```ts
split(march, new Date(2027, 0, 1));
// → undefined (outside March)

split(march, new Date(2026, 2, 1));
// → undefined (at the start: the first part would be empty)
```

Cutting at the very last millisecond works. The second part is then that
one millisecond:

```ts
split(march, new Date(2026, 2, 31, 23, 59, 59, 999));
// → [Mar 1 00:00 – Mar 31 23:59:59.998, Mar 31 23:59:59.999 – 23:59:59.999]
```

## Putting it back together

`mergeWith` joins the parts again and can give the unit back:

```ts
import { mergeWith } from "minuta/intervals";
import { nativeUnits } from "minuta/native";

mergeWith(nativeUnits(), split(march, new Date(2026, 2, 15)), "month");
// → March, unit "month"
```

## Errors

`split` throws a `RangeError` starting with `INVALID_DATE` when `splitDate`
is an invalid Date.

## Related

- [`mergeWith`](../merge-with/) — join periods into one.
- [`divide`](../../minuta/divide/) — cut a period into many equal units.
- [`intervals`](../intervals/) — use it as `time.split(period, date)` with `withUnits`.
