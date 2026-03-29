# merge

Merge multiple periods into a single larger period.

## Usage

```typescript
import { period, divide, merge } from 'minuta/operations'
import { createNativeAdapter } from 'minuta/native'

const adapter = createNativeAdapter()
const week = period(adapter, new Date(), 'week')
const days = divide(adapter, week, 'day')
const merged = merge(adapter, days)
```

## Signatures

```typescript
function merge(
  adapter: Adapter,
  periods: Period[],
  targetUnit?: Unit
): Period | null
```

## Parameters

- `adapter` - `Adapter` - The date adapter instance
- `periods` - `Period[]` - Array of periods to merge
- `targetUnit` - `Unit` (optional) - Force the resulting period to have this unit type

## Returns

`Period | null` - A merged period, or the current day period if array is empty

## Description

The `merge` function combines multiple periods into a single period. It intelligently detects when periods form natural units (like 7 days forming a week) and creates the appropriate period type. Otherwise, it creates a custom period spanning from the earliest start to the latest end.

## Examples

### Basic Usage

```typescript
import { period, divide, merge } from 'minuta/operations'
import { createNativeAdapter } from 'minuta/native'

const adapter = createNativeAdapter()

// Get all days in a week
const week = period(adapter, new Date(), 'week')
const days = divide(adapter, week, 'day')

// Merge back into a week
const mergedWeek = merge(adapter, days)
// Result: Period with type 'week' (natural unit detected)

console.log(mergedWeek.type) // 'week'
```

### Custom Period Merge

```typescript
import { period, merge } from 'minuta/operations'
import { createNativeAdapter } from 'minuta/native'

const adapter = createNativeAdapter()

// Merge arbitrary periods
const period1 = period(adapter, { start: new Date('2024-01-01'), end: new Date('2024-01-10') })
const period2 = period(adapter, { start: new Date('2024-01-11'), end: new Date('2024-01-20') })

const merged = merge(adapter, [period1, period2])
console.log(merged.type) // 'custom'
console.log(merged.start) // 2024-01-01
console.log(merged.end) // 2024-01-20
```

### Force Target Unit

```typescript
import { period, divide, merge } from 'minuta/operations'
import { createNativeAdapter } from 'minuta/native'

const adapter = createNativeAdapter()

// Get 3 days
const week = period(adapter, new Date(), 'week')
const days = divide(adapter, week, 'day').slice(0, 3)

// Force merge as 'week' unit (even though it's only 3 days)
const merged = merge(adapter, days, 'week')
console.log(merged.type) // 'week'
```

## Natural Unit Detection

The function recognizes these patterns:

| Period Count | Period Type | Result Type | Condition |
|--------------|-------------|-------------|-----------|
| 7 | day | week | Must form complete week |
| 3 | month | quarter | Must be consecutive quarter months |
| Other | any | custom | Always creates custom period |

## See Also

- [divide()](/api/operations/divide) - Split periods into smaller units
- [period()](/api/operations/period) - Create periods
- [split()](/api/operations/split) - Split period at specific point
- [Level 1 API](/api/level-1-pure-functions) - Pure functions documentation
