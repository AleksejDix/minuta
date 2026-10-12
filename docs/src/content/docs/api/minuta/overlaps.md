---
title: overlaps
description: Check whether two periods share any time, for example to find clashing bookings.
---

Check whether two periods share any time, for example two bookings that
clash.

```ts
import { overlaps } from "minuta";
```

```ts
overlaps(first, second);
```

## Example

```ts
import { overlaps, range } from "minuta";

const booking = range(new Date(2026, 2, 1), new Date(2026, 2, 10));
const other = range(new Date(2026, 2, 5), new Date(2026, 2, 20));

overlaps(booking, other);
// → true, both include Mar 5 to Mar 10
```

## Parameters

| Name     | What it is        |
| -------- | ----------------- |
| `first`  | One period.       |
| `second` | The other period. |

## Returns

`true` when at least one millisecond is in both periods, otherwise `false`.
The order does not matter: `overlaps(a, b)` equals `overlaps(b, a)`.

A period that lies fully inside the other also overlaps it. To ask whether
one period is _completely_ inside another, use [`contains`](../contains/).

## Neighbours do not overlap

Periods from [`period`](../period/), [`next`](../next/) and
[`divide`](../divide/) end one millisecond before the next one starts, so
neighbours never overlap:

```ts
import { overlaps, period } from "minuta";

const march = period(new Date(2026, 2, 1), "month");
const april = period(new Date(2026, 3, 1), "month");

overlaps(march, april); // → false
```

A period that crosses the border does overlap both sides:

```ts
overlaps(period(new Date(2026, 2, 31), "week"), april);
// → true, the week Mon Mar 30 – Sun Apr 5
```

## Touching ranges do overlap

Both ends of a period are included. A [`range`](../range/) from 9:00 to 10:00
contains 10:00:00.000, and so does a range from 10:00 to 11:00. They share
that one millisecond:

```ts
const nineToTen = range(new Date(2026, 2, 2, 9), new Date(2026, 2, 2, 10));
const tenToEleven = range(new Date(2026, 2, 2, 10), new Date(2026, 2, 2, 11));

overlaps(nineToTen, tenToEleven); // → true
```

To treat back-to-back bookings as free of clashes, end each range one
millisecond earlier (at 9:59:59.999), or build the slots with
[`divide`](../divide/).

## The unit does not matter

`overlaps` only compares times. It needs no units, so it works the same with
every date engine.

## Related

- [`contains`](../contains/) — is one period completely inside the other?
- [`range`](../range/) — make the periods to compare.
- Also exported from [`minuta/core`](../../minuta-core/overview/).
