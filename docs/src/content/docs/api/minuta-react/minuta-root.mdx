---
title: MinutaRoot
description: A React component that runs useMinuta once and shares the result with every component inside it.
---

A component that runs [`useMinuta`](../use-minuta/) once and shares the
result with every component inside it, so they all see the same browsed
period.

```js
import { MinutaRoot } from "minuta-react";
```

```jsx
<MinutaRoot unit="month">{children}</MinutaRoot>
```

## Example

Two separate components share one state: the button moves to the next month,
and the heading shows the year of the browsed month.

```jsx
import { MinutaRoot, useMinutaContext, usePeriod } from "minuta-react";

function Year() {
  const year = usePeriod("year");
  return <h2>{year.start.getFullYear()}</h2>;
}

function NextMonth() {
  const { browse, browsing, next } = useMinutaContext();
  return <button onClick={() => browse(next(browsing))}>Next</button>;
}

export function App() {
  return (
    <MinutaRoot unit="month">
      <Year />
      <NextMonth />
    </MinutaRoot>
  );
}
```

Clicking "Next" in December changes the heading to the next year.

## Props

The props are the options of [`useMinuta`](../use-minuta/#options), plus
`children`.

| Name       | What it is                                               | Default                       |
| ---------- | -------------------------------------------------------- | ----------------------------- |
| `date`     | The date to browse first. Read only once.                | now                           |
| `now`      | The moment that counts as "now".                         | the clock                     |
| `unit`     | The size of the browsed period.                          | `"month"`                     |
| `units`    | The units every function uses, including the week start. | `nativeUnits()`, Monday weeks |
| `children` | The components that read the state.                      | —                             |

`MinutaRoot` renders no element of its own, only its children.

## Reading the state

Inside a `MinutaRoot`, read the state with
[`useMinutaContext`](../use-minuta-context/) (the whole state) or
[`usePeriod`](../use-period/) (one derived period). Both use the closest
`MinutaRoot` above them, so you can nest roots with different units.

When a prop changes, `MinutaRoot` behaves like `useMinuta` with that new
option: a new `unit` or `units` updates every reader, a new `date` does
nothing. See [When it re-renders](../use-minuta/#when-it-re-renders).

## Related

- [`useMinuta`](../use-minuta/) — the hook behind it, and what the state contains.
- [`useMinutaContext`](../use-minuta-context/) — read the state.
- [`usePeriod`](../use-period/) — a period derived from the browsed one.
- [`CalendarRoot`](../calendar-root/) — a `MinutaRoot` for month calendars.
