---
title: sameWith
description: Check whether two periods fall in the same day, week, month or year, with the units you pass.
---

Check whether two periods fall in the same day, week, month or year,
computed with the units you pass. This is where the week start matters most.

```ts
import { sameWith } from "minuta/core";
```

```ts
sameWith(units, first, second, unit);
```

## Example

```ts
import { periodWith, sameWith } from "minuta/core";
import { nativeUnits } from "minuta/native";

const monday = nativeUnits();
const sunday = nativeUnits({ weekStartsOn: "sunday" });

const saturday = periodWith(monday, new Date(2026, 2, 21), "day");
const nextDay = periodWith(monday, new Date(2026, 2, 22), "day");

sameWith(monday, saturday, nextDay, "week"); // → true, Mon–Sun weeks
sameWith(sunday, saturday, nextDay, "week"); // → false, Sun–Sat weeks
```

## Parameters

| Name     | What it is                                                                                            |
| -------- | ----------------------------------------------------------------------------------------------------- |
| `units`  | The units to compare with, e.g. `nativeUnits()`. See [Date engines](../../../concepts/date-engines/). |
| `first`  | One period.                                                                                           |
| `second` | The other period.                                                                                     |
| `unit`   | How coarse to compare: `"year"`, `"month"`, `"week"`, `"day"`, …, or `"custom"`.                      |

## Returns

`true` when both periods _start_ in the same `unit`, as the units see it.
With `"custom"`, `true` only when both start and end are the same
millisecond; `units` is not used then.

It works exactly like [`same`](../../minuta/same/), which is `sameWith` with
`nativeUnits()` bound. Read that page for why only the starts are compared.

## Errors

`sameWith` throws a `RangeError` whose message starts with a code:

| Code                 | When                                                           |
| -------------------- | -------------------------------------------------------------- |
| `UNIT_NOT_SUPPORTED` | `units` has no spec for `unit` (and `unit` is not `"custom"`). |

## Related

- [`same`](../../minuta/same/) (`minuta`) — the same, ready to use.
- [`contains`](../../minuta/contains/) — is a date or period fully inside another?
- [`withUnits`](../with-units/) — bind the units once: `time.same(a, b, unit)`.
