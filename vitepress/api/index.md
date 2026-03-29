# API Reference

Minuta exposes a single, pure-functional API. Once you import an adapter, everything else lives inside the operations module.

## Operations

### Time Division
- [`divide`](/api/operations/divide) - The signature divide() pattern
- [`split`](/api/operations/split) - Advanced splitting with options
- [`merge`](/api/operations/merge) - Merge periods into larger units

### Navigation
- [`period`](/api/operations/period) - Create periods (standard or custom)
- [`next`](/api/operations/next) - Navigate to next period
- [`previous`](/api/operations/previous) - Navigate to previous period
- [`go`](/api/operations/go) - Navigate by steps

### Comparison
- [`isSame`](/api/operations/is-same) - Check period equality
- [`contains`](/api/operations/contains) - Check containment

## Quick Start

```typescript
import { period, divide } from 'minuta/operations'
import { createNativeAdapter } from 'minuta/native'

const adapter = createNativeAdapter()

// Create periods
const month = period(adapter, new Date(), 'month')
const year = period(adapter, new Date(), 'year')

// Divide operations
const weeks = divide(adapter, month, 'week')
const months = divide(adapter, year, 'month')
```

For a complete walkthrough, see [Getting Started](/guide/getting-started).
