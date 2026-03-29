# Level 1: Pure Functions API

The purist approach - minimal bundle size, maximum tree-shaking.

## When to Use

- Performance-critical applications
- You only need a few operations
- You want the smallest possible bundle size
- You prefer explicit dependencies

## Bundle Size

**5-7KB gzipped** for basic usage (period + divide + native adapter)

## Import Pattern

```typescript
import { period, divide, merge } from 'minuta/operations';
import { createNativeAdapter } from 'minuta/native';
```

## Example: Calendar Grid

```typescript
import { period, divide } from 'minuta/operations';
import { createNativeAdapter } from 'minuta/native';

const adapter = createNativeAdapter({ weekStartsOn: 1 });

// Create current month
const month = period(adapter, new Date(), 'month');

// Divide into weeks
const weeks = divide(adapter, month, 'week');

// Render calendar
weeks.forEach(week => {
  const days = divide(adapter, week, 'day');
  console.log(days.map(d => d.date.getDate()));
});
```

## Available Operations

- `period(adapter, date, unit)` - Create a period
- `period(adapter, { start, end })` - Create custom period
- `divide(adapter, period, unit)` - Divide period into smaller units
- `merge(adapter, periods, targetUnit?)` - Merge multiple periods
- `next(adapter, period, count?)` - Get next period
- `previous(adapter, period, count?)` - Get previous period
- `go(adapter, period, direction, count)` - Navigate periods
- `split(period, date)` - Split period at date (pure, no adapter needed)
- `contains(period, date | period)` - Check containment (pure)
- `isSame(adapter, period1, period2, unit)` - Compare periods

## Adapter Creation

```typescript
// Native adapter (no dependencies)
import { createNativeAdapter } from 'minuta/native';
const adapter = createNativeAdapter({ weekStartsOn: 0 }); // Sunday

// date-fns adapter
import { createDateFnsAdapter } from 'minuta/date-fns';
const adapter = createDateFnsAdapter({ weekStartsOn: 1 }); // Monday

// Luxon adapter
import { createLuxonAdapter } from 'minuta/luxon';
const adapter = createLuxonAdapter({ weekStartsOn: 1 });

// Temporal adapter (future)
import { createMinutaAdapter } from 'minuta/temporal';
const adapter = createMinutaAdapter({ weekStartsOn: 1 });
```

## TypeScript Support

Full TypeScript support with strict typing:

```typescript
import type { Adapter, Period, Unit } from 'minuta/types';

const adapter: Adapter = createNativeAdapter();
const month: Period = period(adapter, new Date(), 'month');
```

## Tree-Shaking

Unused operations are completely eliminated from your bundle:

```typescript
// Only imports period and divide - merge, next, previous etc. excluded
import { period, divide } from 'minuta/operations';
```

## Related

- [Operations Guide](/guide/operations)
- [Bundle Size Optimization](/guide/bundle-size-optimization.md)
