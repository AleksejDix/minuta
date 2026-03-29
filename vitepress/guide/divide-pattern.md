# The divide() Pattern

The divide() pattern is the core idea behind Minuta. It lets you treat time as a hierarchy instead of isolated timestamps, so you can derive months from a year, weeks from a month, days from a week, and so on—all with a single function.

## Core Concept

Think of time as a tree:

```
Year
 └─ Month
     └─ Week
         └─ Day
             └─ Hour
                 └─ Minute
                     └─ Second
```

Every node can be split into smaller units. The divide() function performs this split using real calendar math, so you never have to hand-roll date logic.

## Basic Usage

```typescript
import { period, divide } from 'minuta/operations'
import { createNativeAdapter } from 'minuta/native'

const adapter = createNativeAdapter({ weekStartsOn: 1 })

// 1. Create a parent period
const year = period(adapter, new Date(), 'year')

// 2. Divide into child units
const months = divide(adapter, year, 'month')
const january = months[0]

// 3. Keep going as deep as you need
const daysInJanuary = divide(adapter, january, 'day')
const hoursInFirstDay = divide(adapter, daysInJanuary[0], 'hour')
```

## Deep Hierarchies

You can call divide() repeatedly to build the exact structure you need:

```typescript
const adapter = createNativeAdapter()
const year = period(adapter, new Date(), 'year')

const hierarchy = divide(adapter, year, 'month').map(month => ({
  label: month.date.toLocaleString('en', { month: 'long' }),
  weeks: divide(adapter, month, 'week').map(week => ({
    start: week.start,
    days: divide(adapter, week, 'day')
  })),
}))
```

The result is a plain JavaScript object tree that you can render in any framework.

## Type Safety

```typescript
import { divide, period } from 'minuta/operations'
import { createNativeAdapter } from 'minuta/native'

const adapter = createNativeAdapter()
const month = period(adapter, new Date(), 'month')
const day = divide(adapter, month, 'day')[0]

// Valid operations
divide(adapter, month, 'day')
divide(adapter, day, 'hour')

// Invalid units are caught by TypeScript
// divide(adapter, month, 'fortnight') // ❌ compile-time error
```

## Putting It Together

1. Use `period()` to define the top of your hierarchy (e.g., current year or month).
2. Call `divide()` to derive the child units you care about.
3. Loop over the resulting arrays to render calendars, charts, or heatmaps.

That’s it—you get perfectly aligned time structures without touching low-level date math.
