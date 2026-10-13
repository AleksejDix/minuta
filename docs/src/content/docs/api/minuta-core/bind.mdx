---
title: bind
description: Bind every function of a plugin to one set of units, so you can call them without passing the units.
---

Bind every function of a plugin to one set of units, so you can call them
without passing the units each time.

```ts
import { bind } from "minuta/core";
```

```ts
bind(units, plugin);
```

## Example

```ts
import { bind } from "minuta/core";
import { calendar } from "minuta/calendar";
import { nativeUnits } from "minuta/native";

const grids = bind(nativeUnits({ weekStartsOn: "sunday" }), calendar);

grids.monthGrid(new Date(2026, 2, 18)).periods;
// → 42 days, starting Sun Mar 1
```

## Parameters

| Name     | What it is                                                                      |
| -------- | ------------------------------------------------------------------------------- |
| `units`  | The units to bind, usually from an adapter such as `nativeUnits()`.             |
| `plugin` | A plugin: an object whose functions all take the units as their first argument. |

## Returns

A new object with the same names as `plugin`. Each function calls the
original with `units` put in front of your arguments: `grids.monthGrid(date)`
calls `calendar.monthGrid(units, date)`.

`bind` does not change `plugin`.

## What a plugin is

A plugin is a plain object of functions that take the units first, then their
own arguments. That is the same shape as the `…With` functions of
`minuta/core`, so you can write your own:

```ts
import { bind, divideWith } from "minuta/core";
import { nativeUnits } from "minuta/native";
import { period } from "minuta";

const workdays = {
  workdaysIn: (units, month) =>
    divideWith(units, month, "day").filter(
      (day) => day.start.getDay() % 6 !== 0
    ),
};

const march = period(new Date(2026, 2, 1), "month");

bind(nativeUnits(), workdays).workdaysIn(march);
// → 22 day periods, Monday to Friday
```

[`minuta/calendar`](../../minuta-calendar/overview/) and
[`minuta/intervals`](../../minuta-intervals/overview/) ship plugins built this way.

## `bind` or `withUnits`?

[`withUnits`](../with-units/) binds all operations _and_ any plugins in one
object: `time.next(…)` and `time.monthGrid(…)` side by side. Use `bind` when
you only want one plugin's functions, for example in a component that only
draws calendar grids.

## Every member must be a function

`bind` wraps every member of `plugin` as a function. A member that is not a
function is still wrapped, and calling it throws a `TypeError`.

## Related

- [`withUnits`](../with-units/) — bind all operations and plugins at once.
- [`divideWith`](../divide-with/) — one of the `…With` functions you can use inside a plugin.
- [Date engines](../../../concepts/date-engines/) — where units come from.
