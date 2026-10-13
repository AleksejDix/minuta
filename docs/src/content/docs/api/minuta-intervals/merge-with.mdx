---
title: mergeWith
description: Join periods into one that runs from the earliest start to the latest end — and keep a unit like "month" when the result is exactly one.
---

Join several periods into one that runs from the earliest start to the
latest end. When the result is exactly one whole unit, such as one month, it
gets that unit.

```ts
import { mergeWith } from "minuta/intervals";
```

```ts
mergeWith(units, periods, unit?)
```

## Example

```ts
import { mergeWith } from "minuta/intervals";
import { nativeUnits } from "minuta/native";
import { divide, period } from "minuta";

const units = nativeUnits();
const days = divide(period(new Date(2026, 2, 1), "month"), "day"); // the 31 days of March

mergeWith(units, days, "month");
// → { start: Mar 1 00:00, end: Mar 31 23:59:59.999, unit: "month" }

mergeWith(units, days);
// → the same start and end, unit "custom"
```

## Parameters

| Name      | What it is                                                                                                                      |
| --------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `units`   | The units to compute with, e.g. `nativeUnits()`. Used to check whether the result is exactly one `unit`.                        |
| `periods` | The periods to join, in any order.                                                                                              |
| `unit`    | Optional. The unit the result should get if it fits exactly, e.g. `"month"`. Without it, the unit of the first period is tried. |

## Returns

One period from the earliest start to the latest end of all `periods`.

- Its unit is `unit` (or the first period's unit) when the result is
  exactly one whole period of that unit.
- Otherwise its unit is `"custom"`.

`undefined` for an empty list.

## Gaps are filled

`mergeWith` does not check whether the periods touch. It always spans from
the first start to the last end, so anything in between is included:

```ts
mergeWith(units, [
  period(new Date(2026, 0, 1), "month"),
  period(new Date(2026, 2, 1), "month"),
]);
// → Jan 1 – Mar 31 23:59:59.999, unit "custom" (February is included)
```

The same goes for overlapping periods: they become one period with no
double counting.

```ts
import { range } from "minuta";

mergeWith(units, [
  range(new Date(2026, 0, 1, 9), new Date(2026, 0, 1, 11)),
  range(new Date(2026, 0, 1, 10), new Date(2026, 0, 1, 12)),
]);
// → 09:00 – 12:00, unit "custom"
```

If you need to keep separate blocks apart, use [`gap`](../gap/) or
[`overlaps`](../../minuta/overlaps/) to group them first, then merge each
group.

## When the unit is kept

The unit is checked against the `units`, not guessed from the input:

```ts
const jan = period(new Date(2026, 0, 1), "month");
const feb = period(new Date(2026, 1, 1), "month");
const mar = period(new Date(2026, 2, 1), "month");

mergeWith(units, [jan, feb]); // → Jan 1 – Feb 28, "custom" (two months are not a month)
mergeWith(units, [jan, feb], "quarter"); // → "custom" (only part of a quarter)
mergeWith(units, [jan, feb, mar], "quarter"); // → Jan 1 – Mar 31, "quarter"

mergeWith(units, [period(new Date(2026, 2, 3), "day")]); // → Mar 3, "day"
mergeWith(units, [period(new Date(2026, 2, 3), "day")], "week"); // → Mar 3, "custom"
```

Two halves of a custom split come back as the month:

```ts
const firstHalf = range(
  new Date(2026, 0, 1),
  new Date(2026, 0, 15, 23, 59, 59, 999)
);
const secondHalf = range(
  new Date(2026, 0, 16),
  new Date(2026, 0, 31, 23, 59, 59, 999)
);

mergeWith(units, [firstHalf, secondHalf], "month"); // → January, unit "month"
mergeWith(units, [firstHalf, secondHalf]); // → January, unit "custom" (the first is "custom")
```

## Week start

Whether seven days are "a week" depends on the week start of the units.
Mon Mar 16 to Sun Mar 22 2026:

```ts
const days7 = divide(
  range(new Date(2026, 2, 16), new Date(2026, 2, 22, 23, 59, 59, 999)),
  "day"
);

mergeWith(nativeUnits(), days7, "week"); // → unit "week"
mergeWith(nativeUnits({ weekStartsOn: "sunday" }), days7, "week"); // → unit "custom"
```

## Errors

`mergeWith` throws a `RangeError` starting with `UNIT_NOT_SUPPORTED` when
`units` has no spec for the unit it has to check.

## Related

- [`split`](../split/) — the opposite: cut one period in two.
- [`clamp`](../clamp/) — keep only the overlap of two periods.
- [`divide`](../../minuta/divide/) — split a period into units.
- [`intervals`](../intervals/) — use it as `time.merge(periods, unit)` with `withUnits`.
