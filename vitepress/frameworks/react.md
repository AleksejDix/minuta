# React Integration

`minuta-react` exposes idiomatic hooks so React apps get the
same reactive builder API as Vue without any globals.

- Hooks follow standard patterns (`Minuta`, `usePeriod`).
- Works with `useMemo` adapters for dynamic configuration.
- Builder exposes every operation so advanced flows stay in React land.

## Installation

```bash
npm install minuta \
  minuta-react \
  minuta/native
```

## Hooks example

```tsx
import { useMinuta, usePeriod } from "minuta-react";
import { createNativeAdapter } from "minuta/native";

export function MonthCalendar() {
  const temporal = useMinuta({
    adapter: createNativeAdapter({ weekStartsOn: 1 }),
    date: new Date(),
  });

  const month = usePeriod(temporal, "month");
  const weeks = temporal.divide(month, "week");

  return (
    <div>
      <header>
        <button onClick={() => temporal.previous(month)}>Prev</button>
        <span>
          {month.date.toLocaleString("en-US", { month: "long", year: "numeric" })}
        </span>
        <button onClick={() => temporal.next(month)}>Next</button>
      </header>

      <div className="weeks">
        {weeks.map((week) => (
          <div key={week.id} className="week">
            {temporal.divide(week, "day").map((day) => (
              <span key={day.id}>{day.date.getDate()}</span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Reactive adapter with `useMemo`

```tsx
import { useMemo, useState } from "react";
import { Minuta } from "minuta-react";
import { createNativeAdapter } from "minuta/native";

export function App() {
  const [weekStartsOn, setWeekStartsOn] = useState(1);

  const adapter = useMemo(
    () => createNativeAdapter({ weekStartsOn }),
    [weekStartsOn]
  );

  const temporal = useMinuta({ adapter, date: new Date() });

  return (
    <div>
      <button onClick={() => setWeekStartsOn(0)}>Sunday start</button>
      <button onClick={() => setWeekStartsOn(1)}>Monday start</button>
    </div>
  );
}
```

## API surface

- `useMinuta(options)` — Creates a reactive builder bound to React state.
- `usePeriod(temporal, unit)` — Derives the target period as component state.
