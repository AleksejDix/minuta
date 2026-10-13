---
title: minuta/intervals
description: Edit and combine periods — overlap, gap, merge, split, move, resize — and round dates to neat boundaries.
sidebar:
  order: 0
  label: Overview
---

`minuta/intervals` edits and combines periods: find where two overlap or how
far apart they are, join or cut them, move them, change one edge, and round
dates to neat boundaries such as the nearest quarter hour.

```ts
import {
  clamp,
  gap,
  mergeWith,
  move,
  resize,
  snapWith,
  split,
} from "minuta/intervals";
```

It is a separate entry point, so it costs nothing until you import it.

## Functions

| Function                      | What it does                                                  |
| ----------------------------- | ------------------------------------------------------------- |
| [`clamp`](../clamp/)          | The part of a period that lies inside some bounds.            |
| [`gap`](../gap/)              | The free time between two dates or periods.                   |
| [`mergeWith`](../merge-with/) | One period from the earliest start to the latest end.         |
| [`split`](../split/)          | Cut a period in two at a date.                                |
| [`move`](../move/)            | Move a period to a new start, keeping its length.             |
| [`resize`](../resize/)        | Move the start or the end, keeping the other edge.            |
| [`snapWith`](../snap-with/)   | Round a date to a boundary: floor, ceil or nearest, in steps. |
| [`intervals`](../intervals/)  | The plugin: all seven, ready for `withUnits` or `bind`.       |

## Example

A user drags a meeting in a week view. Round the drop point to a quarter
hour, then move the meeting there:

```ts
import { move, snapWith } from "minuta/intervals";
import { nativeUnits } from "minuta/native";
import { range } from "minuta";

const meeting = range(
  new Date(2026, 2, 16, 9, 0),
  new Date(2026, 2, 16, 10, 0)
);
const dropped = new Date(2026, 2, 17, 14, 8);

move(meeting, snapWith(nativeUnits(), dropped, "minute", { step: 15 }));
// → { start: Tue Mar 17 14:15, end: 15:15, unit: "custom" }
```

## Key ideas

- **Results are new periods.** Nothing is changed in place.
- **Edited periods are `"custom"`.** Half a month is not a month, so
  `clamp`, `gap`, `split`, `move` and `resize` always return the unit
  `"custom"`. `mergeWith` is the one way back: it gives a unit such as
  `"month"` when the result is exactly one.
- **A missing result is `undefined`.** No overlap for `clamp`, no time between for
  `gap`, a date outside the period for `split`, crossing edges for `resize`,
  an empty list for `mergeWith`. These cases do not throw; check for
  `undefined`. Only invalid dates and options throw.
- **Ends are included.** A period's `end` is its last millisecond
  (23:59:59.999 for a day). Two neighbouring days touch: there is no gap
  between them.
- **Units only where needed.** `mergeWith` and `snapWith` need units to know
  what a month or a week is. The other five work on the dates alone and take
  no units.

## Learn more

- [Periods and units](../../../concepts/periods-and-units/)
- [Time zones](../../../concepts/time-zones/)
