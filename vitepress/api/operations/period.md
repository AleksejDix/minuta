# period

Creates a period of a specific unit type from a date, or a custom period with start/end dates.

## Usage

```typescript
import { period } from 'minuta/operations'
import { createNativeAdapter } from 'minuta/native'

const adapter = createNativeAdapter()
const month = period(adapter, new Date(), 'month')
```


## Signatures

### Standard Period

```typescript
function period(adapter: Adapter, date: Date, unit: Unit): Period
```

### Custom Period

```typescript
function period(adapter: Adapter, options: { start: Date; end: Date }): Period
```

## Parameters

### Standard Period

- `adapter` - `Adapter` - The date adapter instance
- `date` - `Date` - The date to create the period from
- `unit` - `Unit` - The unit type (`'year'` | `'month'` | `'week'` | `'day'` | `'hour'` | `'minute'` | `'second'` | `'quarter'`)

### Custom Period

- `adapter` - `Adapter` - The date adapter instance
- `options` - `{ start: Date; end: Date }` - Custom period boundaries

## Returns

`Period` - A new period with `start`, `end`, `type`, and `date` properties

## Examples

### Basic Usage

```typescript
import { period } from 'minuta/operations'
import { createNativeAdapter } from 'minuta/native'

const adapter = createNativeAdapter()

// Create different period types
const year = period(adapter, new Date(2024, 0, 15), 'year')
// { type: 'year', date: 2024-01-15, start: 2024-01-01, end: 2024-12-31 23:59:59.999 }

const month = period(adapter, new Date(2024, 5, 15), 'month')
// { type: 'month', date: 2024-06-15, start: 2024-06-01, end: 2024-06-30 23:59:59.999 }

const week = period(adapter, new Date(2024, 0, 15), 'week')
// { type: 'week', date: 2024-01-15, start: 2024-01-14 (Sun), end: 2024-01-20 23:59:59.999 }
```

### Custom Period

```typescript
import { period } from 'minuta/operations'
import { createNativeAdapter } from 'minuta/native'

const adapter = createNativeAdapter()

// Create a custom period (e.g., sprint, fiscal period)
const sprint = period(adapter, {
  start: new Date('2024-01-01'),
  end: new Date('2024-01-14')
})
// { type: 'custom', start: 2024-01-01, end: 2024-01-14, date: 2024-01-07 (midpoint) }
```

## TypeScript

Full type safety across the entire API:

```typescript
import type { Adapter, Period, Unit } from 'minuta'
import { period } from 'minuta/operations'
import { createNativeAdapter } from 'minuta/native'

const adapter: Adapter = createNativeAdapter()
const month: Period = period(adapter, new Date(), 'month')

// Custom period type
const custom: Period = period(adapter, {
  start: new Date('2024-01-01'),
  end: new Date('2024-12-31')
})
```

## See Also

- [divide()](/api/operations/divide) - Divide periods into smaller units
