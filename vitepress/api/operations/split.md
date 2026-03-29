# split

Split a period at a specific date point into two periods.

## Pure Utility Function

This is a pure utility function that doesn't require an adapter. It works the same across all API levels.

```typescript
import { split } from 'minuta/operations'

// Works with any period from any API level
const [before, after] = split(period, splitDate)
```

## Signature

```typescript
function split(period: Period, splitDate: Date): [Period, Period]
```

## Parameters

- `period` - `Period` - The period to split
- `splitDate` - `Date` - The date at which to split the period

## Returns

`[Period, Period]` - A tuple containing two periods:
- `[0]` - The period before the split date
- `[1]` - The period after (and including) the split date

## Description

The `split` function divides a period at a specific date point, creating two new periods:
- **Before**: From period start to just before the split date
- **After**: From the split date to period end

This is useful for breaking periods at arbitrary points that don't align with standard units.

## Examples

### Basic Split

```typescript
import { period, split } from 'minuta/operations'
import { createNativeAdapter } from 'minuta/native'

const adapter = createNativeAdapter()

// Create January period
const january = period(adapter, new Date('2024-01-01'), 'month')

// Split at Jan 15
const splitDate = new Date('2024-01-15')
const [firstHalf, secondHalf] = split(january, splitDate)

console.log(firstHalf.start)  // 2024-01-01
console.log(firstHalf.end)    // 2024-01-14 23:59:59.999
console.log(secondHalf.start) // 2024-01-15
console.log(secondHalf.end)   // 2024-01-31 23:59:59.999
```

### Split Custom Period

```typescript
import { period, split } from 'minuta/operations'
import { createNativeAdapter } from 'minuta/native'

const adapter = createNativeAdapter()

// Custom period (e.g., project timeline)
const project = period(adapter, {
  start: new Date('2024-01-01'),
  end: new Date('2024-12-31')
})

// Split at milestone date
const milestone = new Date('2024-06-01')
const [phase1, phase2] = split(project, milestone)

console.log(phase1) // Jan 1 - May 31
console.log(phase2) // Jun 1 - Dec 31
```

### Edge Cases

```typescript
import { period, split } from 'minuta/operations'
import { createNativeAdapter } from 'minuta/native'

const adapter = createNativeAdapter()
const month = period(adapter, new Date('2024-01-15'), 'month')

// Split at start - first period is empty
const [empty, full] = split(month, month.start)
console.log(empty.start === empty.end) // true (empty period)
console.log(full.start === month.start && full.end === month.end) // true

// Split at end - second period is empty
const [full2, empty2] = split(month, month.end)
console.log(full2.start === month.start && full2.end === month.end) // true
console.log(empty2.start === empty2.end) // true (empty period)
```

### Practical Example: Split at Event

```typescript
import { period, split } from 'minuta/operations'
import { createNativeAdapter } from 'minuta/native'

const adapter = createNativeAdapter()

interface Event {
  name: string
  date: Date
}

function splitByEvent(timePeriod: Period, event: Event) {
  const [before, after] = split(timePeriod, event.date)
  return {
    beforeEvent: before,
    eventAndAfter: after,
    eventName: event.name
  }
}

const year = period(adapter, new Date('2024-01-01'), 'year')
const result = splitByEvent(year, {
  name: 'Product Launch',
  date: new Date('2024-06-15')
})

console.log(result.beforeEvent)    // Jan 1 - Jun 14
console.log(result.eventAndAfter)  // Jun 15 - Dec 31
```

## Special Cases

- **Split at start**: First period is empty (start === end), second is full
- **Split at end**: First period is full, second is empty
- **Split before start**: First period is empty, second is full period
- **Split after end**: First period is full, second is empty
- **Period type preserved**: Both resulting periods have the same type as the original

## TypeScript

Full type safety:

```typescript
import type { Period } from 'minuta'
import { period, split } from 'minuta/operations'
import { createNativeAdapter } from 'minuta/native'

const adapter = createNativeAdapter()
const month: Period = period(adapter, new Date(), 'month')
const splitDate: Date = new Date()

// Type-safe tuple destructuring
const [before, after]: [Period, Period] = split(month, splitDate)
```

## Comparison with divide()

| Function | Purpose | Input | Output |
|----------|---------|-------|--------|
| `split()` | Split at arbitrary date | Date point | 2 periods |
| `divide()` | Split by standard units | Unit type | N periods |

```typescript
// split() - arbitrary point
const [before, after] = split(month, new Date('2024-01-15'))

// divide() - standard units
const days = divide(adapter, month, 'day') // 28-31 periods
```

## See Also

- [divide()](/api/operations/divide) - Divide by standard units
- [merge()](/api/operations/merge) - Combine periods
- [contains()](/api/operations/contains) - Check containment
- [period()](/api/operations/period) - Create periods
