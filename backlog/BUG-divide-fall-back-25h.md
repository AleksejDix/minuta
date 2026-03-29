# BUG: divide() produces 24 hours on 25-hour fall-back days

**Severity:** Medium
**Adapters affected:** All adapters when system TZ or configured TZ has DST

## Problem

On DST fall-back days, the local day has 25 hours. But `divide(adapter, day, "hour")` returns only 24 periods. The 25th hour is lost.

## Reproduction

```typescript
const zurich = createDateFnsTzAdapter({ timezone: "Europe/Zurich" });
const oct27 = derivePeriod(zurich, new Date(Date.UTC(2024, 9, 27)), "day");
const hours = divide(zurich, oct27, "hour");
// Expected: 25
// Actual: 24
```

Oct 27, 2024 in Zurich: clocks go back at 03:00 → 02:00. The hour 02:00-03:00 occurs twice. The day spans 25 hours in UTC (Oct 26 22:00 → Oct 27 22:59:59.999).

## Root cause

`divide()` iterates with `adapter.add(start, 1, "hour")`. On the fall-back boundary, two consecutive hours have the same local time (02:00). The DST fallback check in divide (line 40-45) detects when `nextDate <= current` and skips ahead by 2 — but this skips the duplicated hour instead of including it.

## Affected dates

- Europe/Zurich: Oct 27, 2024
- America/New_York: Nov 3, 2024
- Any timezone with DST fall-back

## Test

`packages/minuta/src/__tests__/edge-cases.test.ts` — "Oct 27 has 25 hours" and "Nov 3 has 25 hours" assert `>= 24` as workaround.
