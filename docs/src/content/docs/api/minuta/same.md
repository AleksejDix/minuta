---
title: same
description: Check whether two periods fall in the same day, week, month or year.
---

Check whether two periods fall in the same day, week, month or year: are
Monday and Friday in the same week, are these two appointments on the same
day.

```ts
import { same } from "minuta";
```

```ts
same(first, second, unit);
```

## Example

```ts
import { period, same } from "minuta";

const monday = period(new Date(2026, 2, 16), "day");
const friday = period(new Date(2026, 2, 20), "day");

same(monday, friday, "week"); // → true
same(monday, friday, "day"); // → false
```

## Parameters

| Name     | What it is                                                                       |
| -------- | -------------------------------------------------------------------------------- |
| `first`  | One period.                                                                      |
| `second` | The other period.                                                                |
| `unit`   | How coarse to compare: `"year"`, `"month"`, `"week"`, `"day"`, …, or `"custom"`. |

## Returns

`true` when both periods _start_ in the same `unit`, otherwise `false`.

The two periods may have any units of their own. A day and an hour can be
compared by day; a day and a year by year:

```ts
same(
  period(new Date(2026, 5, 1), "year"),
  period(new Date(2026, 11, 31), "day"),
  "year"
);
// → true
```

## Only the starts are compared

`same` looks at where each period starts and ignores where it ends. The week
from Mon Mar 30 to Sun Apr 5 starts in March, so it counts as March, even
though most of it is in April:

```ts
const week = period(new Date(2026, 2, 31), "week");

same(week, period(new Date(2026, 2, 1), "month"), "month"); // → true
same(week, period(new Date(2026, 3, 1), "month"), "month"); // → false
```

To check that a period lies entirely in a month, use
[`contains`](../contains/).

## Weeks start on Monday

Saturday and Sunday are in the same week here, because weeks run Monday to
Sunday. Sunday and the Monday after are not:

```ts
same(
  period(new Date(2026, 2, 22), "day"),
  period(new Date(2026, 2, 23), "day"),
  "week"
);
// → false, Sun Mar 22 and Mon Mar 23
```

With weeks that start on Sunday, Saturday and Sunday are in different weeks.
Use `sameWith` from `minuta/core` with your own units for that.

## `"custom"` means "exactly equal"

With the unit `"custom"`, two periods are the same only when both their start
and their end are the same millisecond:

```ts
const wholeDay = period(new Date(2026, 2, 16), "day");
const firstHour = period(new Date(2026, 2, 16, 0), "hour");

same(wholeDay, firstHour, "day"); // → true, same day
same(wholeDay, firstHour, "custom"); // → false, different ends
```

## Errors

`same` throws a `RangeError` whose message starts with a code:

| Code                 | When                                            |
| -------------------- | ----------------------------------------------- |
| `UNIT_NOT_SUPPORTED` | `unit` is not a known unit, e.g. `"fortnight"`. |

## Related

- [`contains`](../contains/) — is a date or period fully inside another?
- [`overlaps`](../overlaps/) — do two periods share any time?
- [`sameWith`](../../minuta-core/same-with/) (`minuta/core`) — the same, with your own units and week start.
