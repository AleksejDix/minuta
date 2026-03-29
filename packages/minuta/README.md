# Minuta

**~4.7 kB gzipped** (core + native adapter, zero dependencies)

Divide time into pieces. Pure functional calendar library with a 4-method adapter contract.

| What you import              | gzipped |
| ---------------------------- | ------- |
| Core + operations            | ~3.7 kB |
| + Native adapter (zero deps) | ~4.7 kB |
| + Calendar utilities         | ~5.1 kB |
| + Helpers                    | ~5.2 kB |

## Install

```bash
npm install minuta
```

## Core Concept

Every time range is a **Period**: `{ start, end, type }`. The `divide()` function splits any period into smaller ones. That's the entire model.

```typescript
import { createNativeAdapter } from "minuta/native";
import { derivePeriod, divide } from "minuta";

const adapter = createNativeAdapter({ weekStartsOn: 1 });

const year = derivePeriod(adapter, new Date(2025, 0, 1), "year");
const months = divide(adapter, year, "month"); // 12 periods
const days = divide(adapter, months[2], "day"); // 31 periods (March)
const hours = divide(adapter, days[0], "hour"); // 24 periods
```

## Operations

All operations are **pure functions** — no side effects, no global state.

```typescript
import {
  derivePeriod, // Derive boundaries from adapter for a date + unit
  createPeriod, // Create a custom period from start/end dates
  divide, // Split a period into smaller units
  next, // Move to the next period
  previous, // Move to the previous period
  go, // Move by N periods
  contains, // Check if a period contains a date or period
  isSame, // Compare two periods by unit
  merge, // Combine periods into one
  split, // Split a period at a specific date
  difference, // Calculate the gap between two periods
} from "minuta";
```

### Navigation

```typescript
const march = derivePeriod(adapter, new Date(2025, 2, 1), "month");
const april = next(adapter, march);
const february = previous(adapter, march);
const june = go(adapter, march, 3);
```

### Containment

```typescript
const month = derivePeriod(adapter, new Date(2025, 2, 15), "month");
contains(month, new Date(2025, 2, 20)); // true
contains(month, new Date(2025, 3, 1)); // false
```

### Custom periods

```typescript
const q1 = createPeriod(new Date(2025, 0, 1), new Date(2025, 2, 31));
// q1.type === "custom"
```

## Helpers

Optional UI utilities for calendar apps:

```typescript
import { isWeekend, isWeekday, isToday, isOverlapping } from "minuta/helpers";

isWeekend(saturdayPeriod); // true
isToday(adapter, new Date(), day); // true if day is today
isOverlapping(meetingA, meetingB); // true if they share time
```

## Calendar Grids

Optional import for fixed-size calendar layouts:

```typescript
import { createStableMonth, createStableYear } from "minuta/calendar";

// Always 42 days (6 weeks) — no layout jumps
const grid = createStableMonth(adapter, 1, new Date(2025, 2, 1));
const weeks = divide(adapter, grid, "week");
const days = weeks.map((week) => divide(adapter, week, "day"));
```

## Adapters

Swap the date engine without changing your code. 4 methods: `startOf`, `endOf`, `add`, `diff`.

```typescript
// Native (zero dependencies)
import { createNativeAdapter } from "minuta/native";

// date-fns
import { createDateFnsAdapter } from "minuta/date-fns";

// date-fns-tz (timezone support)
import { createDateFnsTzAdapter } from "minuta/date-fns-tz";

// Luxon
import { createLuxonAdapter } from "minuta/luxon";

// Temporal API
import { createMinutaAdapter } from "minuta/temporal";
```

## Framework Integrations

```typescript
// Vue
import { createMinuta, useMinuta, usePeriod, Minuta } from "minuta-vue";

// React
import { useMinuta, usePeriod } from "minuta-react";

// Svelte
import { createMinuta, useMinuta, usePeriod } from "minuta-svelte";
```

## Types

```typescript
// A single time range
interface TimePeriod {
  start: Date;
  end: Date;
  type: AdapterUnit | "custom";
}

// A calendar grid container (stableMonth: 42 days, stableYear: 52-53 weeks)
type PeriodSeries =
  | { start: Date; end: Date; type: "stableMonth"; meta: StableMonthMeta }
  | { start: Date; end: Date; type: "stableYear"; meta: StableYearMeta };

// The union — most operations accept this
type Period = TimePeriod | PeriodSeries;

// 4-method contract for date engines
interface Adapter {
  startOf(date: Date, unit: AdapterUnit): Date;
  endOf(date: Date, unit: AdapterUnit): Date;
  add(date: Date, amount: number, unit: AdapterUnit): Date;
  diff(from: Date, to: Date, unit: AdapterUnit): number;
}
```

## License

Apache-2.0
