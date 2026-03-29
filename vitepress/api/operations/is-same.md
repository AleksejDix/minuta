# isSame

Check if two periods represent the same time unit.

## Usage

```typescript
import { period, isSame } from 'minuta/operations'
import { createNativeAdapter } from 'minuta/native'

const adapter = createNativeAdapter()
const period1 = period(adapter, new Date('2024-01-15'), 'day')
const period2 = period(adapter, new Date('2024-01-20'), 'day')

console.log(isSame(adapter, period1, period2, 'month')) // true (same month)
console.log(isSame(adapter, period1, period2, 'day'))   // false (different days)
```

## Signatures

```typescript
function isSame(
  adapter: Adapter,
  a: Period | null | undefined,
  b: Period | null | undefined,
  unit: Unit
): boolean
```

## Parameters

- `adapter` - `Adapter` - The date adapter instance
- `a` - `Period | null | undefined` - First period to compare
- `b` - `Period | null | undefined` - Second period to compare
- `unit` - `Unit` - The unit level to compare at

## Returns

`boolean` - True if both periods represent the same unit, false otherwise

## Description

The `isSame` function compares two periods at a specific unit level. It uses the reference dates (`period.date`) of the periods to determine if they fall within the same time unit. This is useful for checking if two dates/periods are in the same day, month, year, etc.

## Examples

### Check if Same Month

```typescript
import { period, isSame } from 'minuta/operations'
import { createNativeAdapter } from 'minuta/native'

const adapter = createNativeAdapter()

const jan15 = period(adapter, new Date('2024-01-15'), 'day')
const jan30 = period(adapter, new Date('2024-01-30'), 'day')
const feb05 = period(adapter, new Date('2024-02-05'), 'day')

console.log(isSame(adapter, jan15, jan30, 'month'))  // true
console.log(isSame(adapter, jan15, feb05, 'month'))  // false
console.log(isSame(adapter, jan15, jan30, 'day'))    // false
```

### Check if Same Year

```typescript
import { period, isSame } from 'minuta/operations'
import { createNativeAdapter } from 'minuta/native'

const adapter = createNativeAdapter()

const period2024_jan = period(adapter, new Date('2024-01-15'), 'month')
const period2024_dec = period(adapter, new Date('2024-12-15'), 'month')
const period2025_jan = period(adapter, new Date('2025-01-15'), 'month')

console.log(isSame(adapter, period2024_jan, period2024_dec, 'year'))  // true
console.log(isSame(adapter, period2024_jan, period2025_jan, 'year'))  // false
```

### Practical Example: Group Events by Month

```typescript
import { period, isSame } from 'minuta/operations'
import { createNativeAdapter } from 'minuta/native'

const adapter = createNativeAdapter()

interface Event {
  name: string
  date: Date
}

const events: Event[] = [
  { name: 'Event A', date: new Date('2024-01-05') },
  { name: 'Event B', date: new Date('2024-01-15') },
  { name: 'Event C', date: new Date('2024-02-10') }
]

// Group by month
const targetMonth = period(adapter, new Date('2024-01-01'), 'month')
const eventsInMonth = events.filter(event => {
  const eventPeriod = period(adapter, event.date, 'day')
  return isSame(adapter, eventPeriod, targetMonth, 'month')
})

console.log(eventsInMonth) // Events A and B
```

### Check Current Period

```typescript
import { period, isSame } from 'minuta/operations'
import { createNativeAdapter } from 'minuta/native'

const adapter = createNativeAdapter()

function isThisMonth(datePeriod: Period): boolean {
  const now = period(adapter, new Date(), 'month')
  return isSame(adapter, datePeriod, now, 'month')
}

const jan = period(adapter, new Date('2024-01-15'), 'day')
console.log(isThisMonth(jan)) // true if current month is January 2024
```

## Special Cases

- **Returns `false` for null/undefined**: If either period is null or undefined, returns false
- **Custom periods**: For custom periods, compares reference dates exactly
- **Same period**: A period is always "same" as itself

## TypeScript

Full type safety:

```typescript
import type { Adapter, Period, Unit } from 'minuta'
import { period, isSame } from 'minuta/operations'
import { createNativeAdapter } from 'minuta/native'

const adapter: Adapter = createNativeAdapter()
const p1: Period = period(adapter, new Date(), 'day')
const p2: Period = period(adapter, new Date(), 'day')
const unit: Unit = 'month'

const result: boolean = isSame(adapter, p1, p2, unit)
```

## See Also

- [contains()](/api/operations/contains) - Check if period contains a date/period
- [isToday()](/api/utilities/is-today) - Check if period is today
- [period()](/api/operations/period) - Create periods
- [Level 1 API](/api/level-1-pure-functions) - Pure functions documentation
