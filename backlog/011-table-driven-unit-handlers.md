# Unit handlers across date-fns/luxon are mechanical translations

**Effort:** Medium-High (2 hours)
**Savings:** ~160 lines

## Problem

date-fns adapter has 8 unit files that all follow the same pattern:

```typescript
export const yearHandler: UnitHandler = {
  startOf(date) {
    return startOfYear(date);
  },
  endOf(date) {
    return endOfYear(date);
  },
  add(date, amount) {
    return add(date, { years: amount });
  },
  diff(from, to) {
    return differenceInYears(to, from);
  },
};
```

Luxon repeats the same with DateTime wrappers. date-fns-tz wraps with toZonedTime/fromZonedTime.

## Fix

Use a table-driven approach per adapter:

```typescript
const units = {
  year: {
    startOf: startOfYear,
    endOf: endOfYear,
    diff: differenceInYears,
    key: "years",
  },
  month: {
    startOf: startOfMonth,
    endOf: endOfMonth,
    diff: differenceInMonths,
    key: "months",
  },
  // ...
};

function createHandlers(): Record<string, UnitHandler> {
  return Object.fromEntries(
    Object.entries(units).map(([name, { startOf, endOf, diff, key }]) => [
      name,
      {
        startOf,
        endOf,
        add: (d, a) => add(d, { [key]: a }),
        diff: (f, t) => diff(t, f),
      },
    ])
  );
}
```

Note: week and quarter have custom logic and can't be fully table-driven. They stay as explicit handlers.
