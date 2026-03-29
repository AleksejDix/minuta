# Operations

Operations are pure functions that work with Period objects to perform time calculations and transformations.

## Time Division Operations

### [divide](/api/operations/divide)
The signature pattern of Minuta - divide any period into smaller units.

```typescript
const months = divide(temporal, yearPeriod, 'month') // 12 months
const days = divide(temporal, monthPeriod, 'day')    // 28-31 days
```

### [split](/api/operations/split)
Advanced splitting with custom options for unit count or duration.

```typescript
const quarters = split(temporal, yearPeriod, { unit: 'month', count: 3 })
```

### [merge](/api/operations/merge)
Merge multiple periods into a single larger period.

```typescript
const year = merge(temporal, months) // 12 months → 1 year
```

## Navigation Operations

### [period](/api/operations/period)
Create a period of a specific unit type from a date, or create a custom period with specific start and end dates.

```typescript
// Standard period from date
const monthPeriod = period(temporal, new Date(), 'month')

// Custom period with start and end
const customPeriod = period(temporal, { 
  start: new Date('2024-01-01'), 
  end: new Date('2024-03-31') 
})
```

### [next](/api/operations/next)
Navigate to the next period of the same type.

```typescript
const nextMonth = next(temporal, monthPeriod)
```

### [previous](/api/operations/previous)
Navigate to the previous period of the same type.

```typescript
const prevMonth = previous(temporal, monthPeriod)
```

### [go](/api/operations/go)
Navigate forward or backward by a number of steps.

```typescript
const futureMonth = go(temporal, monthPeriod, 3)  // 3 months forward
const pastMonth = go(temporal, monthPeriod, -2)   // 2 months back
```

## Comparison Operations

### [isSame](/api/operations/is-same)
Check if two periods represent the same time unit.

```typescript
const same = isSame(periodA, periodB, 'day')
```

### [contains](/api/operations/contains)
Check if a period contains a date or another period.

```typescript
const isInMonth = contains(monthPeriod, new Date())
```
