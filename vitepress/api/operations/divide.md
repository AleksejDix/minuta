# divide()

The revolutionary `divide()` function is the heart of Minuta's unique time management pattern. It allows you to split any time period into smaller units with perfect synchronization and consistency.

## Usage

```typescript
import { period, divide } from 'minuta/operations'
import { createNativeAdapter } from 'minuta/native'

const adapter = createNativeAdapter()
const month = period(adapter, new Date(), 'month')
const days = divide(adapter, month, 'day')
```


## Signatures

```typescript
function divide(adapter: Adapter, period: Period, unit: Unit): Period[]
```

## Parameters

- `adapter` - `Adapter` - The date adapter instance
- `period` - `Period` - The period to divide
- `unit` - `Unit` - The unit type to divide into

## Return Value

Returns an array of `Period` objects representing the divisions. Each period:

- Contains all standard properties: `type`, `date`, `start`, `end`
- Can be further divided into smaller units
- Represents a complete, non-overlapping time span

## Division Rules

### Valid Divisions

Common division patterns:

| From | To | Typical Result |
|------|----|----------------|
| year | month | 12 months |
| year | week | 52-53 weeks |
| year | day | 365-366 days |
| month | week | 4-6 weeks |
| month | day | 28-31 days |
| week | day | 7 days |
| day | hour | 24 hours |
| hour | minute | 60 minutes |
| minute | second | 60 seconds |

## Examples

### Basic Usage

```typescript
import { period, divide } from 'minuta/operations'
import { createNativeAdapter } from 'minuta/native'

const adapter = createNativeAdapter()

// Divide a month into days
const month = period(adapter, new Date(), 'month')
const days = divide(adapter, month, 'day')
console.log(days.length) // 28-31 depending on month

// Divide a day into hours
const day = period(adapter, new Date(), 'day')
const hours = divide(adapter, day, 'hour')
console.log(hours.length) // 24

// Divide a year into months
const year = period(adapter, new Date(), 'year')
const months = divide(adapter, year, 'month')
console.log(months.length) // 12
```

### Calendar Grid

```typescript
import { period, divide } from 'minuta/operations'
import { createNativeAdapter } from 'minuta/native'

const adapter = createNativeAdapter({ weekStartsOn: 1 }) // Monday

// Create current month
const month = period(adapter, new Date(), 'month')

// Divide into weeks
const weeks = divide(adapter, month, 'week')

// Divide each week into days
weeks.forEach(week => {
  const days = divide(adapter, week, 'day')
  console.log(days.map(d => d.date.getDate()))
})
```

### Custom Period Division

divide() works with any period, including custom periods:

```typescript
import { period, divide } from 'minuta/operations'
import { createNativeAdapter } from 'minuta/native'

const adapter = createNativeAdapter()

// Custom period (e.g., sprint)
const sprint = period(adapter, {
  start: new Date('2024-01-01'),
  end: new Date('2024-01-14')
})

// Divide custom period into days
const sprintDays = divide(adapter, sprint, 'day')
console.log(sprintDays.length) // 14 days
```


## TypeScript

Full type safety across the entire API:

```typescript
import type { Adapter, Period, Unit } from 'minuta'
import { period, divide } from 'minuta/operations'
import { createNativeAdapter } from 'minuta/native'

const adapter: Adapter = createNativeAdapter()
const month: Period = period(adapter, new Date(), 'month')
const days: Period[] = divide(adapter, month, 'day')

// TypeScript catches invalid units at compile time
// const invalid = divide(adapter, month, 'invalid-unit')
// Error: Argument of type '"invalid-unit"' is not assignable to parameter of type 'Unit'

// Generic helper
function getDaysInPeriod(adapter: Adapter, period: Period): Period[] {
  return divide(adapter, period, 'day')
}
```

## Errors

The function throws errors in these cases:

- `Cannot divide by custom unit` - Custom periods have arbitrary boundaries  
- `Unit 'X' cannot be divided into 'Y'` - When division is not valid (e.g., dividing day into month)

The function also has a safety limit of 1000 periods to prevent memory issues.


## See Also

- [period()](/api/operations/period) - Create periods
- [merge()](/api/operations/merge) - Merge periods
- [Level 1 API](/api/level-1-pure-functions) - Pure functions documentation
