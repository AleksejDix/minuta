# Operations Guide

Minuta exposes a small set of pure functions. They all accept an adapter, periods, and simple primitives—no global state.

## Creating Periods

```ts
import { period } from 'minuta/operations'
import { createNativeAdapter } from 'minuta/native'

const adapter = createNativeAdapter({ weekStartsOn: 1 })

const year = period(adapter, new Date(), 'year')
const month = period(adapter, new Date(), 'month')
const custom = period(adapter, {
  start: new Date('2024-01-01'),
  end: new Date('2024-02-01'),
})
```

## Dividing Periods

```ts
import { divide } from 'minuta/operations'

const days = divide(adapter, month, 'day')
const weeks = divide(adapter, month, 'week')
const hours = divide(adapter, days[0], 'hour')
```

## Navigation

```ts
import { next, previous, go } from 'minuta/operations'

const today = period(adapter, new Date(), 'day')
const tomorrow = next(adapter, today)
const yesterday = previous(adapter, today)
const nextWeek = go(adapter, today, 7)   // move forward 7 days
const lastMonth = go(adapter, month, -1) // move back one month
```

## Comparison

```ts
import { isSame, contains } from 'minuta/operations'

const thisMonth = period(adapter, new Date(), 'month')
const sameMonth = isSame(adapter, thisMonth, period(adapter, new Date(), 'month'), 'month')
const isToday = contains(thisMonth, new Date())
```

## Utility Recipes

- **All business days**
  ```ts
  const businessDays = divide(adapter, thisMonth, 'day').filter(
    day => ![0, 6].includes(day.date.getDay())
  )
  ```

- **Rolling window**
  ```ts
  function rollingMonths(date: Date, count: number) {
    const start = period(adapter, date, 'month')
    const months = []
    for (let i = 0; i < count; i++) {
      months.push(go(adapter, start, i))
    }
    return months
  }
  ```

These primitives compose into anything: timelines, analytics dashboards, booking calendars, or custom scheduling tools.
