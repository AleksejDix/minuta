---
title: nextWith
description: Get the period right after a period — the next day, week or month — with the units you pass.
---

Get the period right after a period (the next day, week or month), computed
with the units you pass.

```ts
import { nextWith } from "minuta/core";
```

```ts
nextWith(units, period);
```

## Example

```ts
import { nextWith, periodWith } from "minuta/core";
import { nativeUnits } from "minuta/native";

const units = nativeUnits({ weekStartsOn: "sunday" });
const week = periodWith(units, new Date(2026, 2, 18), "week");
// → Sun Mar 15 – Sat Mar 21

nextWith(units, week);
// → Sun Mar 22 00:00:00.000 – Sat Mar 28 23:59:59.999, unit "week"
```

## Parameters

| Name     | What it is                                                                                            |
| -------- | ----------------------------------------------------------------------------------------------------- |
| `units`  | The units to compute with, e.g. `nativeUnits()`. See [Date engines](../../../concepts/date-engines/). |
| `period` | The current period.                                                                                   |

## Returns

A new, whole period of the same unit that starts right after `period`.
`nextWith(units, p)` is the same as [`shiftWith(units, p, 1)`](../shift-with/).

It works exactly like [`next`](../../minuta/next/), which is `nextWith` with
`nativeUnits()` bound. Read that page for daylight saving and for custom
periods, which move by their own length.

## Use the same units as the period

Pass the units the period was made with. `nextWith` steps from the period's
start and then rounds to a whole unit with _these_ units. A Monday week moved
with Sunday units comes out as a Sunday week:

```ts
import { nextWith, periodWith } from "minuta/core";
import { nativeUnits } from "minuta/native";

const mondayWeek = periodWith(nativeUnits(), new Date(2026, 2, 18), "week");
// → Mon Mar 16 – Sun Mar 22

nextWith(nativeUnits({ weekStartsOn: "sunday" }), mondayWeek);
// → Sun Mar 22 – Sat Mar 28
```

[`withUnits`](../with-units/) makes this hard to get wrong: everything on the
bound object uses one set of units.

## Errors

`nextWith` throws a `RangeError` whose message starts with a code:

| Code                 | When                                   |
| -------------------- | -------------------------------------- |
| `INVALID_DATE`       | `period.start` is an invalid `Date`.   |
| `UNIT_NOT_SUPPORTED` | `units` has no spec for `period.unit`. |

## Related

- [`next`](../../minuta/next/) (`minuta`) — the same, ready to use.
- [`previousWith`](../previous-with/) — the period before.
- [`shiftWith`](../shift-with/) — move by any number of periods.
