---
title: shiftWith
description: Move a period forward or back by a number of its own unit, with the units you pass.
---

Move a period forward or back by a number of its own unit (two weeks ahead,
three months back), computed with the units you pass.

```ts
import { shiftWith } from "minuta/core";
```

```ts
shiftWith(units, period, steps);
```

## Example

```ts
import { periodWith, shiftWith } from "minuta/core";
import { nativeUnits } from "minuta/native";

const units = nativeUnits({ weekStartsOn: "sunday" });
const week = periodWith(units, new Date(2026, 2, 18), "week");
// → Sun Mar 15 – Sat Mar 21

shiftWith(units, week, 2);
// → Sun Mar 29 00:00:00.000 – Sat Apr 4 23:59:59.999, unit "week"
```

## Parameters

| Name     | What it is                                                                                            |
| -------- | ----------------------------------------------------------------------------------------------------- |
| `units`  | The units to compute with, e.g. `nativeUnits()`. See [Date engines](../../../concepts/date-engines/). |
| `period` | The period to move.                                                                                   |
| `steps`  | How many periods to move, as a whole number. Positive moves forward, negative back.                   |

## Returns

A new, whole period of the same unit, `steps` periods away. With `steps` of
`0`, the very same `period` object comes back.

It works exactly like [`shift`](../../minuta/shift/), which is `shiftWith`
with `nativeUnits()` bound. Read that page for how the period's own unit is
used and how custom periods move by their own length.

## Custom periods need no units

A period with the unit `"custom"` moves by its length in milliseconds, so
`units` is not used for it at all. Any set of units, even an empty one,
gives the same result:

```ts
import { range, shiftWith } from "minuta/core";

const slot = range(
  new Date(2026, 2, 2, 9),
  new Date(2026, 2, 2, 9, 59, 59, 999)
);

shiftWith({}, slot, 2);
// → Mon Mar 2 11:00:00.000 – 11:59:59.999, unit "custom"
```

Pass the units the period was made with for every other period; see
[`nextWith`](../next-with/#use-the-same-units-as-the-period) for why.

## Errors

`shiftWith` throws a `RangeError` whose message starts with a code:

| Code                 | When                                                      |
| -------------------- | --------------------------------------------------------- |
| `INVALID_DATE`       | `period.start` is an invalid `Date`, or `steps` is `NaN`. |
| `UNIT_NOT_SUPPORTED` | `units` has no spec for `period.unit`.                    |

## Related

- [`shift`](../../minuta/shift/) (`minuta`) — the same, ready to use.
- [`nextWith`](../next-with/) and [`previousWith`](../previous-with/) — move by one.
- [`periodWith`](../period-with/) — create the period to move.
