# @allystudio/usetemporal-react

React integration package for `@allystudio/usetemporal`. Built on React hooks, it provides a reactive temporal instance where `browsing`, `now`, and derived periods update automatically with React's state management.

## Installation

```bash
npm install @allystudio/usetemporal @allystudio/usetemporal-react
```

Install whichever adapter you need:

```bash
npm install @allystudio/usetemporal/native
```

## Quick Start

```tsx
import { useTemporal, usePeriod } from "@allystudio/usetemporal-react";
import { createNativeAdapter } from "@allystudio/usetemporal/native";

function Calendar() {
  const temporal = useTemporal({
    adapter: createNativeAdapter(),
    date: new Date(),
  });

  const month = usePeriod(temporal, "month");
  const weeks = temporal.divide(month, "week");

  return (
    <div>
      <button onClick={() => temporal.previous(month)}>Previous</button>
      <button onClick={() => temporal.next(month)}>Next</button>
      {/* Render calendar using weeks */}
    </div>
  );
}
```

### Reactive adapter with useMemo

```tsx
import { useMemo, useState } from "react";
import { useTemporal } from "@allystudio/usetemporal-react";
import { createNativeAdapter } from "@allystudio/usetemporal/native";

function App() {
  const [weekStartsOn, setWeekStartsOn] = useState(1);

  // Adapter recreates when weekStartsOn changes
  const adapter = useMemo(
    () => createNativeAdapter({ weekStartsOn }),
    [weekStartsOn]
  );

  const temporal = useTemporal({ adapter, date: new Date() });

  return (
    <div>
      <button onClick={() => setWeekStartsOn(0)}>Start week on Sunday</button>
      <button onClick={() => setWeekStartsOn(1)}>Start week on Monday</button>
    </div>
  );
}
```

### Calendar Component Example

```tsx
import { useTemporal, usePeriod } from "@allystudio/usetemporal-react";
import { createNativeAdapter } from "@allystudio/usetemporal/native";

function MonthCalendar() {
  const temporal = useTemporal({
    adapter: createNativeAdapter(),
    date: new Date(),
  });

  const month = usePeriod(temporal, "month");
  const weeks = temporal.divide(month, "week");

  return (
    <div className="calendar">
      <header>
        <button onClick={() => temporal.previous(month)}>←</button>
        <h2>
          {month.date.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </h2>
        <button onClick={() => temporal.next(month)}>→</button>
      </header>

      <div className="weeks">
        {weeks.map((week, i) => {
          const days = temporal.divide(week, "day");
          return (
            <div key={i} className="week">
              {days.map((day, j) => (
                <div
                  key={j}
                  className={
                    temporal.contains(month, day.date)
                      ? "day"
                      : "day other-month"
                  }
                >
                  {day.date.getDate()}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

### Drop-in example component

Need a ready-made playground? Import the packaged calendar straight from the
components entry point:

```tsx
import { CalendarExample } from "@allystudio/usetemporal-react/components";

export function Demo() {
  return (
    <main className="app-shell">
      <CalendarExample />
    </main>
  );
}
```

## API

### `useTemporal(options: UseTemporalOptions): TemporalBuilder`

Creates a reactive temporal instance with builder methods.

**Options:**

- `adapter: Adapter` (required) - Date adapter instance
- `date?: Date` - Initial browsing date (defaults to `new Date()`)
- `now?: Date` - Initial now date (defaults to `new Date()`)
- `weekStartsOn?: number` - Week start day, 0=Sunday, 1=Monday (defaults to 1)

**Returns:** A temporal builder with:

- `adapter: Adapter` - The current adapter
- `weekStartsOn: number` - Week start day configuration
- `browsing: Period` - Current browsing period (reactive)
- `now: Period` - Current time period (reactive)
- Builder methods: `period()`, `divide()`, `merge()`, `next()`, `previous()`, `go()`, `split()`, `contains()`, `isSame()`

### `usePeriod(temporal: TemporalBuilder, unit: Unit): Period`

Creates a reactive period that updates when `browsing` changes.

**Parameters:**

- `temporal: TemporalBuilder` - The temporal instance from `useTemporal`
- `unit: Unit` - Period unit type (`'year'`, `'month'`, `'week'`, `'day'`, etc.)

**Returns:** A period that automatically updates when browsing changes

### Builder Methods

All operations from `@allystudio/usetemporal/operations` are available as builder methods:

```tsx
const temporal = useTemporal({ adapter, date: new Date() });

// Create periods
const year = temporal.period(new Date(), "year");
const custom = temporal.period({ start: date1, end: date2 });

// Divide and merge
const months = temporal.divide(year, "month");
const merged = temporal.merge(months.slice(0, 3));

// Navigate (automatically updates browsing state)
temporal.next(months[0]);
temporal.previous(months[0]);
temporal.go(months[0], 5);

// Utilities
temporal.split(period, date);
temporal.contains(period, date);
temporal.isSame(period1, period2, "day");
```

### Re-exported Operations

All core operations and types are re-exported for convenience:

```tsx
import {
  // Hooks
  useTemporal,
  usePeriod,

  // Operations
  period,
  divide,
  merge,
  split,
  next,
  previous,
  go,
  contains,
  isSame,
  isToday,
  isWeekday,
  isWeekend,

  // Types
  type Period,
  type Unit,
  type Adapter,
  type TemporalBuilder,

  // Constants
  UNITS,
  YEAR,
  MONTH,
  WEEK,
  DAY,
} from "@allystudio/usetemporal-react";
```

## Navigation State Management

Navigation helpers always keep `browsing` in sync with the period you pass,
making it safe to drive state changes from derived periods.

```tsx
const temporal = useTemporal({ adapter, date: new Date() });
const month = usePeriod(temporal, "month");

// Derived navigation reuses the same helpers
temporal.next(month);

// The memoized month recomputes automatically
console.log(month.date); // New date after navigation

const otherPeriod = temporal.period(new Date(2025, 0, 1), "month");

// Any navigation updates browsing
temporal.previous(otherPeriod);
console.log(temporal.browsing.date); // Reflects the previous month
```

## Testing

```bash
npm run build --workspace=@allystudio/usetemporal-react
TZ=UTC npm test --workspace=@allystudio/usetemporal-react
npm run type-check --workspace=@allystudio/usetemporal-react
```

## Documentation

Complete documentation available at https://usetemporal.vercel.app

## License

Apache 2.0 © Aleksej Dix
