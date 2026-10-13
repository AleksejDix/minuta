---
title: durationWith
description: Count how many whole units fit into a period — the hours in a day, the days in a month — with the units you pass.
---

Count how many whole units fit into a period (the hours in a day, the days in
a month), computed with the units you pass.

```ts
import { durationWith } from "minuta/core";
```

```ts
durationWith(units, period, unit);
```

## Example

```ts
import { durationWith, periodWith } from "minuta/core";
import { nativeUnits } from "minuta/native";

const units = nativeUnits();

durationWith(units, periodWith(units, new Date(2026, 1, 1), "month"), "day");
// → 28

durationWith(units, periodWith(units, new Date(2026, 2, 29), "day"), "hour");
// → 23 in Europe/Zurich, the clocks go forward that night
```

## Parameters

| Name     | What it is                                                                                            |
| -------- | ----------------------------------------------------------------------------------------------------- |
| `units`  | The units to compute with, e.g. `nativeUnits()`. See [Date engines](../../../concepts/date-engines/). |
| `period` | The period to measure.                                                                                |
| `unit`   | What to count: `"day"`, `"hour"`, `"week"`, `"month"`, …                                              |

## Returns

A whole number: how many complete `unit`s fit from the start of `period` to
one millisecond after its end. Units that only partly fit are not counted.

It works exactly like [`duration`](../../minuta/duration/), which is
`durationWith` with `nativeUnits()` bound. Read that page for partial units,
month ends and ranges that end at midnight.

## The time zone comes from the units

Whether a day has 23, 24 or 25 hours depends on the time zone the units
compute in. A time-zone adapter counts in its zone, wherever the code runs:

```ts
import { durationWith, periodWith } from "minuta/core";
import { dateFnsTzUnits } from "minuta/date-fns-tz";

const newYork = dateFnsTzUnits({ timeZone: "America/New_York" });
const day = periodWith(newYork, new Date("2026-03-08T12:00:00Z"), "day");

durationWith(newYork, day, "hour");
// → 23, the clocks go forward in New York on Mar 8 2026
```

## Errors

`durationWith` throws a `RangeError` whose message starts with a code:

| Code                 | When                            |
| -------------------- | ------------------------------- |
| `UNIT_NOT_SUPPORTED` | `units` has no spec for `unit`. |

## Related

- [`duration`](../../minuta/duration/) (`minuta`) — the same, ready to use.
- [`length`](../../minuta/length/) — the length in milliseconds; needs no units.
- [`divideWith`](../divide-with/) — create the pieces instead of counting them.
