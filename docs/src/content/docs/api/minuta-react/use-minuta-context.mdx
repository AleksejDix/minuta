---
title: useMinutaContext
description: A React hook that reads the minuta state of the closest MinutaRoot.
---

A hook that reads the minuta state of the closest
[`MinutaRoot`](../minuta-root/) (or [`CalendarRoot`](../calendar-root/))
above the component.

```js
import { useMinutaContext } from "minuta-react";
```

```js
const minuta = useMinutaContext();
```

## Example

A label that shows the browsed month and how many days it has.

```jsx
import { MinutaRoot, useMinutaContext } from "minuta-react";

function MonthInfo() {
  const { browsing, divide } = useMinutaContext();
  const days = divide(browsing, "day").length;

  return (
    <p>
      {browsing.start.toLocaleDateString("en-US", { month: "long" })} has {days}{" "}
      days
    </p>
  );
}

export function App() {
  return (
    <MinutaRoot date={new Date(2024, 1, 10)}>
      <MonthInfo />
    </MinutaRoot>
  );
}
```

This renders "February has 29 days" (2024 is a leap year).

## Returns

The same object that [`useMinuta`](../use-minuta/#returns) returns:
`browsing`, `browse`, `now`, `units`, and every bound function (`period`,
`next`, `previous`, `shift`, `divide`, …).

Every component that calls `useMinutaContext()` under the same root gets the
same object. When one of them calls `browse()`, all of them re-render with the
new `browsing`.

## Errors

Outside a `MinutaRoot` it throws an `Error`:

```text
useMinutaContext() must be used within <MinutaRoot>
```

A `CalendarRoot` counts as a `MinutaRoot`, so the hook works inside a calendar
too.

## Related

- [`MinutaRoot`](../minuta-root/) — provides the state.
- [`useMinuta`](../use-minuta/) — what the state contains.
- [`usePeriod`](../use-period/) — a shortcut for one derived period.
