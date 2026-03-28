# minuta

**~4.7 kB gzipped** (core + native adapter, zero dependencies)

Declarative calendar library built on the **Period + divide()** pattern. Model time as hierarchical, immutable data — swap date engines without changing your UI.

| What you import              | gzipped |
| ---------------------------- | ------- |
| Core + operations            | ~3.7 kB |
| + Native adapter (zero deps) | ~4.7 kB |
| + Calendar utilities         | ~5.1 kB |
| + date-fns adapter           | ~5.4 kB |
| + date-fns-tz adapter        | ~8.2 kB |

## Install

```bash
npm install minuta
```

## Core Concept

Every time range is a **Period**: `{ start, end, type, date }`. The `divide()` function splits any period into smaller ones. That's the entire model.

```typescript
import { createNativeAdapter } from "minuta/native";
import { derivePeriod, divide } from "minuta/operations";

const adapter = createNativeAdapter({ weekStartsOn: 1 });

const year = derivePeriod(adapter, new Date(2025, 0, 1), "year");
const months = divide(adapter, year, "month"); // 12 month periods
const days = divide(adapter, months[2], "day"); // 31 day periods (March)
const hours = divide(adapter, days[0], "hour"); // 24 hour periods
```

## Operations

All operations are **pure functions** — no side effects, no global state.

```typescript
import {
  derivePeriod, // Derive boundaries from adapter for a date + unit
  createPeriod, // Create a custom period from start/end dates (no adapter needed)
  divide, // Split a period into smaller units
  next, // Move to the next period
  previous, // Move to the previous period
  go, // Move by N periods
  contains, // Check if a period contains a date or period
  isSame, // Compare two periods by unit
  merge, // Combine periods into one
  split, // Split a period at a specific date
  difference, // Calculate the gap between two periods
} from "minuta/operations";

// Utilities
import { isToday, isWeekend, isWeekday } from "minuta/operations";
```

### Navigation

```typescript
const march = derivePeriod(adapter, new Date(2025, 2, 1), "month");
const april = next(adapter, march);
const february = previous(adapter, march);
const june = go(adapter, march, 3);
```

### Containment and comparison

```typescript
const month = derivePeriod(adapter, new Date(2025, 2, 15), "month");
contains(month, new Date(2025, 2, 20)); // true
contains(month, new Date(2025, 3, 1)); // false

const day1 = derivePeriod(adapter, new Date(2025, 2, 15), "day");
const day2 = derivePeriod(adapter, new Date(2025, 2, 15), "day");
isSame(adapter, day1, day2, "month"); // true (same month)
```

### Custom periods

```typescript
const q1 = createPeriod(new Date(2025, 0, 1), new Date(2025, 2, 31));
// q1.type === "custom"
```

## Calendar Utilities

Optional import for calendar grid layouts:

```typescript
import { createStableMonth, createStableYear } from "minuta/calendar";

// Always 42 days (6 weeks) — no layout jumps
const grid = createStableMonth(adapter, 1, new Date(2025, 2, 1));
const weeks = divide(adapter, grid, "week");
const days = weeks.map((week) => divide(adapter, week, "day"));
```

## Adapters

Swap the date engine without changing your code. The adapter interface is 4 methods: `startOf`, `endOf`, `add`, `diff`.

### Native (zero dependencies)

```typescript
import { createNativeAdapter } from "minuta/native";
const adapter = createNativeAdapter({ weekStartsOn: 1 });
```

### date-fns

```bash
npm install date-fns
```

```typescript
import { createDateFnsAdapter } from "minuta/date-fns";
const adapter = createDateFnsAdapter({ weekStartsOn: 1 });
```

### date-fns-tz (timezone support)

```bash
npm install date-fns date-fns-tz
```

```typescript
import { createDateFnsTzAdapter } from "minuta/date-fns-tz";
const adapter = createDateFnsTzAdapter({
  timezone: "Europe/Zurich",
  weekStartsOn: 1,
});
```

### Luxon

```bash
npm install luxon
```

```typescript
import { createLuxonAdapter } from "minuta/luxon";
const adapter = createLuxonAdapter({ weekStartsOn: 1 });
```

### Temporal API (polyfill)

```bash
npm install @js-temporal/polyfill
```

```typescript
import { createTemporalAdapter } from "minuta/temporal";
const adapter = createTemporalAdapter({ weekStartsOn: 1 });
```

## Framework Integrations

| Framework  | Package         | Status |
| ---------- | --------------- | ------ |
| Vue 3      | `minuta-vue`    | Beta   |
| React 18+  | `minuta-react`  | Beta   |
| Svelte 4/5 | `minuta-svelte` | Beta   |

## Types

```typescript
interface Period {
  start: Date; // Inclusive start
  end: Date; // Inclusive end
  type: Unit; // "year" | "quarter" | "month" | "week" | "day" | "hour" | "minute" | "second" | "custom" | "stableMonth" | "stableYear"
  date: Date; // Reference date used to create this period
}

interface Adapter {
  startOf(date: Date, unit: AdapterUnit): Date;
  endOf(date: Date, unit: AdapterUnit): Date;
  add(date: Date, amount: number, unit: AdapterUnit): Date;
  diff(from: Date, to: Date, unit: AdapterUnit): number;
}

type AdapterUnit =
  | "year"
  | "quarter"
  | "month"
  | "week"
  | "day"
  | "hour"
  | "minute"
  | "second";
```

## License

Apache-2.0
