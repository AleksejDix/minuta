# contains

Check if a period contains a date or another period.

## Pure Utility Function

This is a pure utility function that doesn't require an adapter. It works the same across all API levels.

```typescript
import { contains } from 'minuta/operations'

// Works with any period from any API level
const result = contains(period, targetDate)
```

## Signature

```typescript
function contains(period: Period, target: Date | Period): boolean
```

## Parameters

- `period` - `Period` - The period to check within
- `target` - `Date | Period` - The date or period to check for containment

## Returns

`boolean` - True if the target is fully contained within the period

## Description

The `contains` function determines whether a date or period falls within the boundaries of another period:
- **For dates**: Checks if the date falls between the period's start and end (inclusive)
- **For periods**: Checks if the entire target period is contained within the source period

## Examples

### Check Date Containment

```typescript
import { period, contains } from 'minuta/operations'
import { createNativeAdapter } from 'minuta/native'

const adapter = createNativeAdapter()
const january = period(adapter, new Date('2024-01-15'), 'month')

// Check if dates are in January
console.log(contains(january, new Date('2024-01-01')))  // true (start)
console.log(contains(january, new Date('2024-01-15')))  // true (mid)
console.log(contains(january, new Date('2024-01-31')))  // true (end)
console.log(contains(january, new Date('2024-02-01')))  // false (outside)
```

### Check Period Containment

```typescript
import { period, contains } from 'minuta/operations'
import { createNativeAdapter } from 'minuta/native'

const adapter = createNativeAdapter()

const year = period(adapter, new Date('2024-01-01'), 'year')
const january = period(adapter, new Date('2024-01-15'), 'month')
const december = period(adapter, new Date('2024-12-15'), 'month')

console.log(contains(year, january))   // true
console.log(contains(year, december))  // true
console.log(contains(january, year))   // false (year is larger)
```

### Filtering Items by Date Range

```typescript
import { period, contains } from 'minuta/operations'
import { createNativeAdapter } from 'minuta/native'

const adapter = createNativeAdapter()

interface Event {
  name: string
  date: Date
}

const events: Event[] = [
  { name: 'New Year', date: new Date('2024-01-01') },
  { name: 'Valentine', date: new Date('2024-02-14') },
  { name: 'Birthday', date: new Date('2024-01-20') }
]

// Get events in January
const january = period(adapter, new Date('2024-01-01'), 'month')
const januaryEvents = events.filter(event => contains(january, event.date))

console.log(januaryEvents)
// [{ name: 'New Year', ... }, { name: 'Birthday', ... }]
```

### Custom Period Containment

```typescript
import { period, contains } from 'minuta/operations'
import { createNativeAdapter } from 'minuta/native'

const adapter = createNativeAdapter()

// Custom period (e.g., Q1 fiscal period)
const q1Fiscal = period(adapter, {
  start: new Date('2024-02-01'),
  end: new Date('2024-04-30')
})

console.log(contains(q1Fiscal, new Date('2024-03-15')))  // true
console.log(contains(q1Fiscal, new Date('2024-01-15')))  // false
```

## Special Cases

- **Boundaries are inclusive**: Both start and end dates are considered contained
- **Self-containment**: A period always contains itself
- **Timestamp precision**: Works with full millisecond precision
- **Null/undefined**: Returns `false` for null or undefined targets

## TypeScript

Full type safety:

```typescript
import type { Period } from 'minuta'
import { period, contains } from 'minuta/operations'
import { createNativeAdapter } from 'minuta/native'

const adapter = createNativeAdapter()
const month: Period = period(adapter, new Date(), 'month')

// Type-safe checks
const hasDate: boolean = contains(month, new Date())
const hasPeriod: boolean = contains(month, period(adapter, new Date(), 'day'))
```

## See Also

- [isSame()](/api/operations/is-same) - Compare periods at specific unit level
- [split()](/api/operations/split) - Split period at specific point
- [isToday()](/api/utilities/is-today) - Check if period is today
- [period()](/api/operations/period) - Create periods
