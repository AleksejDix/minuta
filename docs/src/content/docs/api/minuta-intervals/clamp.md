---
title: clamp
description: Cut a period down to the part that lies inside some bounds — e.g. a selection limited to the allowed dates.
---

Cut a period down to the part that lies inside some bounds. Use it to keep a
selection within the allowed dates, or to find the overlap of two periods.

```ts
import { clamp } from "minuta/intervals";
```

```ts
clamp(period, bounds);
```

## Example

```ts
import { clamp } from "minuta/intervals";
import { range } from "minuta";

const selection = range(new Date(2026, 0, 5), new Date(2026, 0, 25));
const allowed = range(new Date(2026, 0, 10), new Date(2026, 0, 20));

clamp(selection, allowed);
// → { start: Sat Jan 10 2026 00:00, end: Tue Jan 20 2026 00:00, unit: "custom" }
```

## Parameters

| Name     | What it is                   |
| -------- | ---------------------------- |
| `period` | The period to cut.           |
| `bounds` | The period it must fit into. |

## Returns

The part of `period` that is inside `bounds`: it starts at the later of the
two starts and ends at the earlier of the two ends. Its unit is always
`"custom"`.

`undefined` when the two do not overlap at all.

## No overlap gives undefined

```ts
import { period } from "minuta";

const march = period(new Date(2026, 2, 1), "month");

clamp(period(new Date(2026, 2, 15), "day"), march);
// → Mar 15 00:00 – Mar 15 23:59:59.999, unit "custom"

clamp(period(new Date(2026, 3, 15), "day"), march);
// → undefined (April 15 is not in March)
```

## Touching at one moment

Periods include their end. When the end of one is exactly the start of the
other, they share that one millisecond, and the result is a period of that
single moment:

```ts
clamp(
  range(new Date(2026, 0, 1), new Date(2026, 0, 10)),
  range(new Date(2026, 0, 10), new Date(2026, 0, 20))
);
// → { start: Jan 10 00:00, end: Jan 10 00:00, unit: "custom" }
```

## The unit is lost

The result is always `"custom"`, even when nothing was cut:

```ts
clamp(march, march);
// → Mar 1 – Mar 31 23:59:59.999, unit "custom"
```

If you need the unit back, use `mergeWith(units, [result], "month")`: it
gives the unit `"month"` back when the result is exactly one month.

## Order matters only for naming

`clamp(a, b)` and `clamp(b, a)` give the same start and end: both are the
overlap. The names just say which one you think of as the limit.

## Related

- [`overlaps`](../../minuta/overlaps/) — only check whether two periods overlap.
- [`gap`](../gap/) — the time between two periods that do not overlap.
- [`resize`](../resize/) — move one edge of a period yourself.
- [`intervals`](../intervals/) — use it as `time.clamp(period, bounds)` with `withUnits`.
