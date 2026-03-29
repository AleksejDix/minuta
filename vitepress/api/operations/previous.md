# previous

Navigate to the previous period of the same type.

## Usage

```typescript
import { period, previous } from 'minuta/operations'
import { createNativeAdapter } from 'minuta/native'

const adapter = createNativeAdapter()
const month = period(adapter, new Date(), 'month')
const lastMonth = previous(adapter, month)
```

## Signatures

```typescript
function previous(adapter: Adapter, period: Period): Period
```

## Parameters

- `adapter` - `Adapter` - The date adapter instance
- `period` - `Period` - The current period to navigate from

## Returns

`Period` - The previous period of the same type and duration

## Description

Creates a new period that immediately precedes the given period, maintaining the same unit type and duration. For custom periods, the duration is preserved.

## Examples

### Basic Usage

```typescript
import { period, previous } from 'minuta/operations'
import { createNativeAdapter } from 'minuta/native'

const adapter = createNativeAdapter()

// Navigate to previous day
const today = period(adapter, new Date(), 'day')
const yesterday = previous(adapter, today)

// Navigate to previous month
const month = period(adapter, new Date(), 'month')
const lastMonth = previous(adapter, month)

// Navigate to previous year
const year = period(adapter, new Date(), 'year')
const lastYear = previous(adapter, year)
```

### Custom Period Navigation

```typescript
import { period, previous } from 'minuta/operations'
import { createNativeAdapter } from 'minuta/native'

const adapter = createNativeAdapter()

// Custom period (e.g., sprint)
const sprint = period(adapter, {
  start: new Date('2024-01-15'),
  end: new Date('2024-01-29') // 14 days
})

// Previous sprint (preserves duration)
const previousSprint = previous(adapter, sprint)
// { start: 2024-01-01, end: 2024-01-15, type: 'custom' }
```

### Chaining Navigation

```typescript
import { period, previous } from 'minuta/operations'
import { createNativeAdapter } from 'minuta/native'

const adapter = createNativeAdapter()

// Navigate multiple steps backward
const month = period(adapter, new Date(), 'month')
const twoMonthsAgo = previous(adapter, previous(adapter, month))

// Or use go() for better performance
import { go } from 'minuta/operations'
const twoMonthsAgo2 = go(adapter, month, -2)
```

## TypeScript

Full type safety:

```typescript
import type { Adapter, Period } from 'minuta'
import { period, previous } from 'minuta/operations'
import { createNativeAdapter } from 'minuta/native'

const adapter: Adapter = createNativeAdapter()
const month: Period = period(adapter, new Date(), 'month')
const lastMonth: Period = previous(adapter, month)
```

## See Also

- [next()](/api/operations/next) - Navigate forward
- [go()](/api/operations/go) - Navigate multiple steps at once
- [period()](/api/operations/period) - Create periods
- [Level 1 API](/api/level-1-pure-functions) - Pure functions documentation
