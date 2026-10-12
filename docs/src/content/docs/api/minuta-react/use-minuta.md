---
title: useMinuta
description: A React hook that binds every minuta function to your units and keeps the browsed period in state.
---

A hook that gives you every minuta function bound to your units, plus a
_browsed period_ — the month (or week, day, …) the user is looking at — kept
in React state.

```js
import { useMinuta } from "minuta-react";
```

```js
useMinuta({ date, now, unit, units });
```

## Example

A button that shows the browsed month and moves to the next month on click.

```jsx
import { useMinuta } from "minuta-react";

function MonthPager() {
  const minuta = useMinuta({ unit: "month" });

  return (
    <button onClick={() => minuta.browse(minuta.next(minuta.browsing))}>
      {minuta.browsing.start.toDateString()}
    </button>
  );
}
```

The first render shows the first day of the current month, for example
"Sun Mar 01 2026". Each click shows the first day of the next month.

## Options

All options are optional. You can call `useMinuta()` with nothing.

| Name    | What it is                                                                | Default                       |
| ------- | ------------------------------------------------------------------------- | ----------------------------- |
| `date`  | The date to browse first. Read only once, on the first render.            | now                           |
| `now`   | The moment that counts as "now". Pass it to fix "today", e.g. in tests.   | the clock                     |
| `unit`  | The size of the browsed period: `"month"`, `"week"`, `"day"`, `"year"`, … | `"month"`                     |
| `units` | The units every function uses. The week start lives here.                 | `nativeUnits()`, Monday weeks |

```js
import { nativeUnits } from "minuta/native";

const sundayFirst = nativeUnits({ weekStartsOn: "sunday" });

useMinuta({ units: sundayFirst, unit: "week" });
```

## Returns

An object with the state and every bound function.

| Name       | What it is                                                                                     |
| ---------- | ---------------------------------------------------------------------------------------------- |
| `browsing` | The browsed period, in `unit`. Starts as the period that contains `date`.                      |
| `browse`   | `browse(period)` moves to the period of `unit` that contains `period.start`.                   |
| `now`      | "Now" as a one-second period. `now.start` is the current moment.                               |
| `units`    | The units the functions are bound to.                                                          |
| `period`   | `period(date, unit)` — the period of `unit` that contains `date`.                              |
| `next`     | `next(period)` — the period right after it, same unit.                                         |
| `previous` | `previous(period)` — the period right before it, same unit.                                    |
| `shift`    | `shift(period, steps)` — move a period by whole units, back with a negative number.            |
| `divide`   | `divide(period, unit)` — split a period into smaller ones. See [divide](../../minuta/divide/). |
| `duration` | `duration(period, unit)` — how many whole units fit into a period.                             |
| `contains` | `contains(period, dateOrPeriod)` — whether it lies fully inside the period.                    |
| `same`     | `same(a, b, unit)` — whether two periods fall into the same `unit`.                            |
| `overlaps` | `overlaps(a, b)` — whether two periods share any time.                                         |
| `range`    | `range(start, end)` — a custom period between two dates.                                       |
| `length`   | `length(period)` — the length of a period in milliseconds.                                     |

These are the same functions as in the core, without the units argument.

`browse` takes any period, not only one of `unit`. With `unit: "month"`,
`browse(someDay)` browses the month of that day.

## When it re-renders

- `browse()` changes the browsed period and re-renders the component.
- A new `unit` re-computes `browsing` around the same browsed date. After
  `browse(march)`, switching to `"week"` browses the week that contains
  March 1.
- A new `units` object binds the functions again. Create units once (outside
  the component, or with `useMemo`), or the functions are rebound on every
  render.
- `date` is only the start. Changing it later does not move the browsed
  period; call `browse()` for that.
- The returned object stays the same between renders until something above
  changes, so it is safe in effect and memo dependency lists. `browse` never
  changes.

## "Today" stays correct

Without a `now` option, the hook reads the clock once and sets a timer for the
start of the next day (in the units' days). When it fires, `now` moves to the
new day, so a calendar left open overnight marks the right day as today. The
timer is cleared when the component unmounts.

With a `now` option, no timer runs. `now` follows the value you pass.

## Related

- [`MinutaRoot`](../minuta-root/) — run this hook once and share it with children.
- [`usePeriod`](../use-period/) — a period derived from the browsed one.
- [period](../../minuta/period/) — what a period is.
- [divide](../../minuta/divide/) — split a period into smaller ones.
