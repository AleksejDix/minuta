# go

Navigate forward or backward by multiple periods at once.

## Usage

```typescript
import { period, go } from 'minuta/operations'
import { createNativeAdapter } from 'minuta/native'

const adapter = createNativeAdapter()
const month = period(adapter, new Date(), 'month')
const threeMonthsLater = go(adapter, month, 3)
```

## Signatures

```typescript
function go(adapter: Adapter, period: Period, steps: number): Period
```

## Parameters

- `adapter` - `Adapter` - The date adapter instance
- `period` - `Period` - The current period to navigate from
- `steps` - `number` - Number of steps to move (positive = forward, negative = backward, 0 = no change)

## Returns

`Period` - A new period moved by the specified number of steps

## Description

Allows navigation by multiple periods in a single operation. More efficient than calling `next()` or `previous()` multiple times.

- **Positive steps**: Navigate forward (like calling `next()` multiple times)
- **Negative steps**: Navigate backward (like calling `previous()` multiple times)
- **Zero steps**: Returns the same period (no change)

## Examples

### Basic Usage

```typescript
import { period, go } from 'minuta/operations'
import { createNativeAdapter } from 'minuta/native'

const adapter = createNativeAdapter()
const month = period(adapter, new Date(), 'month')

// Navigate forward
const threeMonthsLater = go(adapter, month, 3)
const nextYear = go(adapter, month, 12)

// Navigate backward
const twoMonthsAgo = go(adapter, month, -2)
const lastYear = go(adapter, month, -12)

// No change
const sameMonth = go(adapter, month, 0)
```

### Quarters and Years

```typescript
import { period, go } from 'minuta/operations'
import { createNativeAdapter } from 'minuta/native'

const adapter = createNativeAdapter()

// Navigate quarters
const quarter = period(adapter, new Date(), 'quarter')
const nextQuarter = go(adapter, quarter, 1)
const nextYear = go(adapter, quarter, 4) // 4 quarters = 1 year

// Navigate years
const year = period(adapter, new Date(), 'year')
const fiveYearsLater = go(adapter, year, 5)
const decade Ago = go(adapter, year, -10)
```

### Custom Period Navigation

```typescript
import { period, go } from 'minuta/operations'
import { createNativeAdapter } from 'minuta/native'

const adapter = createNativeAdapter()

// Custom period (e.g., 2-week sprint)
const sprint = period(adapter, {
  start: new Date('2024-01-01'),
  end: new Date('2024-01-14')
})

// Navigate sprints (preserves duration)
const sprint3 = go(adapter, sprint, 3) // 3 sprints later
const sprintBefore = go(adapter, sprint, -1) // 1 sprint before
```

### Practical Example: Date Range Selector

```typescript
import { period, go } from 'minuta/operations'
import { createNativeAdapter } from 'minuta/native'

const adapter = createNativeAdapter()

function getDateRange(baseDate: Date, offset: number, unit: 'day' | 'week' | 'month') {
  const basePeriod = period(adapter, baseDate, unit)
  return go(adapter, basePeriod, offset)
}

// Get last month
const lastMonth = getDateRange(new Date(), -1, 'month')

// Get next week
const nextWeek = getDateRange(new Date(), 1, 'week')

// Get 30 days from now
const thirtyDaysLater = getDateRange(new Date(), 30, 'day')
```

## TypeScript

Full type safety:

```typescript
import type { Adapter, Period } from 'minuta'
import { period, go } from 'minuta/operations'
import { createNativeAdapter } from 'minuta/native'

const adapter: Adapter = createNativeAdapter()
const month: Period = period(adapter, new Date(), 'month')

// Type-safe navigation
const future: Period = go(adapter, month, 5)
const past: Period = go(adapter, month, -3)
```

## Performance

`go()` is more efficient than chaining multiple `next()` or `previous()` calls:

```typescript
// Less efficient
const result1 = next(adapter, next(adapter, next(adapter, month)))

// More efficient
const result2 = go(adapter, month, 3)
```

## See Also

- [next()](/api/operations/next) - Navigate one step forward
- [previous()](/api/operations/previous) - Navigate one step backward
- [period()](/api/operations/period) - Create periods
