---
title: resize
description: Move the start or the end of a period and keep the other edge — e.g. make a meeting longer.
---

Move the start or the end of a period while the other edge stays where it
is. Use it to make a meeting longer or to start a booking earlier.

```ts
import { resize } from "minuta/intervals";
```

```ts
resize(period, edge, newDate);
```

## Example

```ts
import { resize } from "minuta/intervals";
import { range } from "minuta";

const meeting = range(
  new Date(2026, 2, 29, 9, 0),
  new Date(2026, 2, 29, 10, 0)
);

resize(meeting, "end", new Date(2026, 2, 29, 11, 30));
// → { start: 09:00, end: 11:30, unit: "custom" }

resize(meeting, "start", new Date(2026, 2, 29, 8, 0));
// → { start: 08:00, end: 10:00, unit: "custom" }
```

## Parameters

| Name      | What it is                                |
| --------- | ----------------------------------------- |
| `period`  | The period to change.                     |
| `edge`    | Which edge to move: `"start"` or `"end"`. |
| `newDate` | The new date for that edge.               |

## Returns

A new period with the moved edge. Its unit is always `"custom"`. The
original period is not changed.

`undefined` when the new edge would cross the other one, that is, when the
start would come after the end.

## Edges that cross

```ts
resize(meeting, "start", new Date(2026, 2, 29, 11, 0));
// → undefined (11:00 is after the end, 10:00)

resize(meeting, "end", new Date(2026, 2, 29, 8, 59));
// → undefined (8:59 is before the start, 9:00)
```

Moving an edge onto the other one is allowed. The result is a period of a
single moment:

```ts
resize(meeting, "end", new Date(2026, 2, 29, 9, 0));
// → { start: 09:00, end: 09:00, unit: "custom" }
```

## The end is included

Periods include their last millisecond. A day ends at 23:59:59.999, not at
midnight of the next day. When you resize to the end of a day, pass that
last millisecond, or take it from a period: `period(date, "day").end`.

```ts
import { period } from "minuta";

const day = period(new Date(2026, 2, 1), "day");

resize(day, "end", new Date(2026, 2, 1, 23, 59, 59, 999));
// → Mar 1 00:00 – 23:59:59.999, unit "custom" (the whole day, but no longer "day")
```

## Errors

`resize` throws a `RangeError` starting with `INVALID_DATE` when `newDate`
is an invalid Date.

## Related

- [`move`](../move/) — move the whole period and keep its length.
- [`clamp`](../clamp/) — cut a period to fit into bounds.
- [`snapWith`](../snap-with/) — round the new edge to a neat time first.
- [`intervals`](../intervals/) — use it as `time.resize(period, edge, date)` with `withUnits`.
