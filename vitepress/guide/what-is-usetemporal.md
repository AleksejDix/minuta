# What is Minuta?

Minuta is a tiny library that treats time as a hierarchy of periods rather than a collection of loose timestamps. Instead of juggling `Date` methods, you create a period (year, month, week, day, etc.) and then subdivide it as deep as you need.

## The Core Idea

```typescript
import { period, divide } from 'minuta/operations'
import { createNativeAdapter } from 'minuta/native'

const adapter = createNativeAdapter({ weekStartsOn: 1 })

const year = period(adapter, new Date(), 'year')
const months = divide(adapter, year, 'month')
const firstMonth = months[0]
const days = divide(adapter, firstMonth, 'day')
```

That’s the entire API. There are no builders, classes, or global state—just simple pure functions that return plain objects.

## Why It Matters

- **Hierarchical thinking**: Reason about time like a tree (year → month → week → day).
- **No manual math**: `divide()` handles tricky calendar edges for you.
- **Framework agnostic**: Works with React, Vue, Svelte, or vanilla JavaScript because it only returns data structures.
- **Super small**: Core operations plus the native adapter come in under 6 KB gzipped.

## Typical Use Cases

- Calendar and scheduling UIs
- Time-based visualizations (heatmaps, timelines, dashboards)
- Reports that need consistent period boundaries

If you can describe the time structure you need, divide() can build it. The rest of the documentation shows how to compose these primitives for real projects.
