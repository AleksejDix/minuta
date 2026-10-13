---
title: gap
description: Get the free time between two dates or periods — e.g. the break between two meetings.
---

Get the free time between two dates or periods, such as the break between
two meetings or the days between two bookings.

```ts
import { gap } from "minuta/intervals";
```

```ts
gap(from, to);
```

## Example

```ts
import { gap } from "minuta/intervals";
import { period } from "minuta";

gap(period(new Date(2026, 2, 2), "day"), period(new Date(2026, 2, 5), "day"));
// → { start: Tue Mar 3 00:00, end: Wed Mar 4 23:59:59.999, unit: "custom" }
```

## Parameters

| Name   | What it is                |
| ------ | ------------------------- |
| `from` | One date or period.       |
| `to`   | The other date or period. |

You can mix them: a period and a date work too.

## Returns

The period strictly between the two: it starts one millisecond after the
earlier one ends, and ends one millisecond before the later one starts. Its
unit is always `"custom"`.

`undefined` when there is no time between them: they touch or overlap.

## Order does not matter

`gap` finds out which one comes first:

```ts
gap(period(new Date(2026, 2, 5), "day"), period(new Date(2026, 2, 2), "day"));
// → Mar 3 00:00 – Mar 4 23:59:59.999, the same as above
```

## Touching or overlapping periods have no gap

Mar 2 ends at 23:59:59.999 and Mar 3 starts one millisecond later. Nothing
lies between them:

```ts
gap(period(new Date(2026, 2, 2), "day"), period(new Date(2026, 2, 3), "day"));
// → undefined (they touch)

gap(period(new Date(2026, 2, 2), "day"), period(new Date(2026, 2, 1), "month"));
// → undefined (March contains Mar 2)
```

## Dates count as one millisecond

A date is a single moment. The gap starts one millisecond after it, so
results between dates look a little odd at the edges:

```ts
gap(new Date(2026, 2, 2, 9), new Date(2026, 2, 2, 10));
// → 09:00:00.001 – 09:59:59.999

gap(period(new Date(2026, 2, 2, 9), "hour"), new Date(2026, 2, 2, 12));
// → 10:00 – 11:59:59.999 (the hour 9:00 ends at 09:59:59.999)
```

To measure a gap, pass it to `duration`, e.g.
`duration(gap(a, b), "minute")`.

## Errors

`gap` throws a `RangeError` starting with `INVALID_DATE` when `from` or `to`
is an invalid Date.

```ts
gap(new Date("nope"), new Date());
// RangeError: INVALID_DATE: from is an invalid Date. …
```

## Related

- [`clamp`](../clamp/) — the overlap of two periods, the opposite of a gap.
- [`overlaps`](../../minuta/overlaps/) — check whether two periods overlap.
- [`duration`](../../minuta/duration/) — how long the gap is.
- [`intervals`](../intervals/) — use it as `time.gap(a, b)` with `withUnits`.
