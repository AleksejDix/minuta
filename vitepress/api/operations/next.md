# next

Navigate to the next period of the same type.

## Usage

```typescript
import { period, next } from 'minuta/operations'
import { createNativeAdapter } from 'minuta/native'

const adapter = createNativeAdapter()
const month = period(adapter, new Date(), 'month')
const nextMonth = next(adapter, month)
```

## Signatures

```typescript
function next(adapter: Adapter, period: Period): Period
```

## Parameters

- `adapter` - `Adapter` - The date adapter instance
- `period` - `Period` - The current period to navigate from

## Returns

`Period` - The next period of the same type and duration

## Description

Creates a new period that immediately follows the given period, maintaining the same unit type and duration. For custom periods, the duration is preserved.

## Examples

### Basic Usage

```typescript
import { period, next } from 'minuta/operations'
import { createNativeAdapter } from 'minuta/native'

const adapter = createNativeAdapter()

// Navigate to next day
const today = period(adapter, new Date(), 'day')
const tomorrow = next(adapter, today)

// Navigate to next month
const month = period(adapter, new Date(), 'month')
const nextMonth = next(adapter, month)

// Navigate to next year
const year = period(adapter, new Date(), 'year')
const nextYear = next(adapter, year)
```

### Custom Period Navigation

```typescript
import { period, next } from 'minuta/operations'
import { createNativeAdapter } from 'minuta/native'

const adapter = createNativeAdapter()

// Custom period (e.g., sprint)
const sprint = period(adapter, {
  start: new Date('2024-01-01'),
  end: new Date('2024-01-14') // 14 days
})

// Next sprint (preserves duration)
const nextSprint = next(adapter, sprint)
// { start: 2024-01-14, end: 2024-01-28, type: 'custom' }
```

### Chaining Navigation

```typescript
import { period, next } from 'minuta/operations'
import { createNativeAdapter } from 'minuta/native'

const adapter = createNativeAdapter()

// Navigate multiple steps
const month = period(adapter, new Date(), 'month')
const twoMonthsLater = next(adapter, next(adapter, month))

// Or use go() for better performance
import { go } from 'minuta/operations'
const twoMonthsLater2 = go(adapter, month, 2)
```

## TypeScript

Full type safety:

```typescript
import type { Adapter, Period } from 'minuta'
import { period, next } from 'minuta/operations'
import { createNativeAdapter } from 'minuta/native'

const adapter: Adapter = createNativeAdapter()
const month: Period = period(adapter, new Date(), 'month')
const nextMonth: Period = next(adapter, month)
```

## See Also

- [previous()](/api/operations/previous) - Navigate backward
- [go()](/api/operations/go) - Navigate multiple steps at once
- [period()](/api/operations/period) - Create periods
- [Level 1 API](/api/level-1-pure-functions) - Pure functions documentation
