---
title: specFor
description: Look up the rules for one unit (start, end, add, count) in a set of units.
---

Look up the rules for one unit in a set of units, for example to find the
start of a week or to add a month with exactly the rules minuta uses.

```ts
import { specFor } from "minuta/core";
```

```ts
specFor(units, unit);
```

## Example

```ts
import { specFor } from "minuta/core";
import { nativeUnits } from "minuta/native";

const week = specFor(nativeUnits(), "week");

week.startOf(new Date(2026, 2, 18));
// → Mon Mar 16 2026 00:00:00.000
```

## Parameters

| Name    | What it is                                                       |
| ------- | ---------------------------------------------------------------- |
| `units` | A set of units, usually from an adapter such as `nativeUnits()`. |
| `unit`  | The unit to look up: `"day"`, `"week"`, `"month"`, …             |

## Returns

The _spec_ of that unit: an object with four functions. Every unit-aware
operation in minuta is built from these four.

| Function            | What it does                                                       |
| ------------------- | ------------------------------------------------------------------ |
| `startOf(date)`     | The first millisecond of the unit that contains `date`.            |
| `endOf(date)`       | The last millisecond of the unit that contains `date`.             |
| `add(date, amount)` | `date` moved by `amount` units; negative moves back.               |
| `diff(from, to)`    | How many whole units fit from `from` to `to`, rounded toward zero. |

```ts
const month = specFor(nativeUnits(), "month");

month.endOf(new Date(2026, 1, 10)); // → Sat Feb 28 2026 23:59:59.999
month.add(new Date(2026, 0, 31), 1); // → Sat Feb 28 2026 00:00:00.000
month.diff(new Date(2026, 0, 31), new Date(2026, 1, 28)); // → 1
```

Adding a month to Jan 31 gives Feb 28: the day is cut to fit the shorter
month.

## When to use it

Most code never needs `specFor`: use [`periodWith`](../period-with/) or
[`withUnits`](../with-units/) instead. It is useful when you write a plugin
or your own unit, and want the same lookup, and the same error, as the
built-in operations.

## Errors

`specFor` throws a `RangeError` whose message starts with a code:

| Code                 | When                            |
| -------------------- | ------------------------------- |
| `UNIT_NOT_SUPPORTED` | `units` has no spec for `unit`. |

The message lists the units that _are_ there:

```ts
const { day, month } = nativeUnits();

specFor({ day, month }, "hour");
// RangeError: UNIT_NOT_SUPPORTED: no "hour" spec in the units passed (available: day, month). …
```

## Related

- [`periodWith`](../period-with/) — the period of a unit that contains a date.
- [Date engines](../../../concepts/date-engines/) — where units come from, and how to add your own.
- [`MinutaError`](../../minuta/minuta-error/) — all error codes.
