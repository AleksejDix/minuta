---
title: usePeriod
description: A React hook that returns the year, week, day or other period that contains the start of the browsed period.
---

A hook that returns the period of a given unit — a year, a week, a day, … —
that contains the start of the browsed period of the closest
[`MinutaRoot`](../minuta-root/).

```js
import { usePeriod } from "minuta-react";
```

```js
const year = usePeriod("year");
```

## Example

While the root browses months, show the year and the first week of the
browsed month.

```jsx
import { MinutaRoot, usePeriod } from "minuta-react";

function Context() {
  const year = usePeriod("year");
  const week = usePeriod("week");

  return (
    <p>
      Year {year.start.getFullYear()}, first week starts{" "}
      {week.start.toDateString()}
    </p>
  );
}

export function App() {
  return (
    <MinutaRoot unit="month" date={new Date(2024, 2, 13)}>
      <Context />
    </MinutaRoot>
  );
}
```

This renders "Year 2024, first week starts Mon Feb 26 2024": March 1, 2024 is
a Friday, and its week starts on the Monday before.

## Parameters

| Name   | What it is                                                      |
| ------ | --------------------------------------------------------------- |
| `unit` | The unit of the period you want: `"year"`, `"week"`, `"day"`, … |

## Returns

A [period](../../minuta/period/) of `unit` that contains
`browsing.start`. It is the same as
`period(browsing.start, unit)` from [`useMinutaContext`](../use-minuta-context/).

It uses the root's units, so `"week"` follows the root's week start.

## When it updates

The result changes when the root browses somewhere else, or when its units or
`unit` change. Between those, the same period object is returned, so it is safe
in dependency lists.

## Errors

Outside a `MinutaRoot` it throws the error of
[`useMinutaContext`](../use-minuta-context/#errors):
`useMinutaContext() must be used within <MinutaRoot>`.

## Related

- [`useMinutaContext`](../use-minuta-context/) — the whole state.
- [`MinutaRoot`](../minuta-root/) — provides the browsed period.
- [period](../../minuta/period/) — what a period is.
