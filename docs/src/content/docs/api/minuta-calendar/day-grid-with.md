---
title: dayGridWith
description: Get the real hours of a day — 24 on most days, 23 or 25 when the clocks change — each labelled with its clock hour.
---

Get the real hours of one day, each labelled with the hour on the clock.
Most days have 24 hours. The day the clocks go forward has 23, and the day
they go back has 25.

```ts
import { dayGridWith } from "minuta/calendar";
```

```ts
dayGridWith(units, date);
```

## Example

```ts
import { dayGridWith } from "minuta/calendar";
import { nativeUnits } from "minuta/native";

// On a computer in Europe/Zurich
const grid = dayGridWith(nativeUnits(), new Date(2026, 5, 1));

grid.periods.length; // → 24
grid.periods[0]; // → { start: Jun 1 00:00, end: Jun 1 00:59:59.999, unit: "hour", hour: 0 }
grid.gapHour; // → undefined
grid.ambiguousHour; // → undefined
```

## Parameters

| Name    | What it is                                                                                                 |
| ------- | ---------------------------------------------------------------------------------------------------------- |
| `units` | The units to compute with, e.g. `nativeUnits()` or `dateFnsTzUnits({ timeZone })`. Needs `day` and `hour`. |
| `date`  | Any moment inside the day you want.                                                                        |

## Returns

An object with three fields:

- `periods` — one hour period per real hour of the day, in order. Each has
  `start`, `end` and `unit` like any period, plus `hour`: the hour on the
  clock, 0 to 23.
- `gapHour` — the clock hour that does not exist that day because the clocks
  jumped forward, or `undefined`.
- `ambiguousHour` — the clock hour that happens twice that day because the
  clocks went back, or `undefined`.

## Clocks going forward: 23 hours

Many time zones have daylight saving time (DST). On one night in spring the
clocks jump forward one hour. In Europe/Zurich on Mar 29 2026 the clock goes
from 01:59:59 straight to 03:00. The hour 2:00 never happens.

```ts
// On a computer in Europe/Zurich
const spring = dayGridWith(nativeUnits(), new Date(2026, 2, 29));

spring.periods.length; // → 23
spring.periods.map((slot) => slot.hour);
// → [0, 1, 3, 4, 5, …, 23]
spring.gapHour; // → 2
```

## Clocks going back: 25 hours

On one night in autumn the clocks go back one hour, so one clock hour happens
twice. In Europe/Zurich on Oct 25 2026 the hour 2:00 comes once in summer
time and once more in winter time. Both are in the grid, as two different
periods with `hour: 2`.

```ts
const autumn = dayGridWith(nativeUnits(), new Date(2026, 9, 25));

autumn.periods.length; // → 25
autumn.periods.map((slot) => slot.hour);
// → [0, 1, 2, 2, 3, 4, …, 23]
autumn.ambiguousHour; // → 2
autumn.periods[2]; // → 02:00–02:59:59.999 summer time (CEST), hour 2
autumn.periods[3]; // → 02:00–02:59:59.999 winter time (CET),  hour 2
```

Use `gapHour` and `ambiguousHour` to show a hint in a day view, e.g. "2:00
happens twice tonight".

## Another time zone

The hours are computed and labelled in the time zone of the `units`. Native
units use the computer's time zone. To show a day in another zone, use units
that have one, such as [`dateFnsTzUnits`](../../adapters/date-fns-tz-units/):

```ts
import { dateFnsTzUnits } from "minuta/date-fns-tz";

const newYork = dateFnsTzUnits({ timeZone: "America/New_York" });
const grid = dayGridWith(newYork, new Date("2024-03-10T12:00:00Z"));

grid.periods.length; // → 23
grid.gapHour; // → 2
grid.periods[0].start.toISOString(); // → "2024-03-10T05:00:00.000Z" (midnight in New York)
```

The labels come from the `timeZone` setting of the units. All adapters set
it. If you build your own units without it, the computer's time zone is used.

:::caution
A few zones move their clocks by 30 minutes, such as Australia/Lord_Howe.
On those days the hours do not line up with the clock, and the grid can
contain a 30-minute slot. `gapHour` and `ambiguousHour` are not reliable
there.
:::

## Errors

`dayGridWith` throws a `RangeError` whose message starts with a code:

| Code                 | When                                                |
| -------------------- | --------------------------------------------------- |
| `INVALID_DATE`       | `date` is an invalid Date, e.g. `new Date("nope")`. |
| `UNIT_NOT_SUPPORTED` | `units` has no `day` or `hour`.                     |

## Related

- [`monthGridWith`](../month-grid-with/) — the days of a month view.
- [`calendar`](../calendar/) — use it as `time.dayGrid(date)` with `withUnits`.
- [`duration`](../../minuta/duration/) — count the hours of a day without
  creating them.
- [Time zones](../../../concepts/time-zones/) — DST and zone-aware units
  explained.
