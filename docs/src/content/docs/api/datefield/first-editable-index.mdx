---
title: firstEditableIndex
description: The index of the first segment you can type into, such as the day in de-CH or the year in ja-JP.
---

Find the first segment you can type into: the day in `de-CH`, the month in
`en-US`, the year in `ja-JP`.

```ts
import { firstEditableIndex } from "datefield";
```

```ts
firstEditableIndex(segments);
```

## Example

```ts
import { deriveFormat, firstEditableIndex, fromDate } from "datefield";

const format = deriveFormat("en-US", {
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});
const segments = fromDate(new Date(2026, 2, 31), format);
// "Tue, 03/31/2026" → weekday, ", ", month, "/", day, "/", year

firstEditableIndex(segments); // → 2   the month; the weekday cannot be typed
```

## Parameters

| Name       | What it is                                                                           |
| ---------- | ------------------------------------------------------------------------------------ |
| `segments` | Segments, from [`parseSegments`](../parse-segments/) or [`fromDate`](../from-date/). |

## Returns

The index of the first day, month, year, hour, minute or second segment.
Separators and display-only parts (weekday, era, AM/PM, …) are skipped. `-1`
when there is no editable segment.

Use it to put the cursor in the first segment, for example on focus or on the
Home key:

```ts
const segments = parseSegments(format, field.buffer.text);
field = setSelection(field, segments[firstEditableIndex(segments)].start);
```

## Related

- [`lastEditableIndex`](../last-editable-index/) — the last one.
- [`nextSegment`](../next-segment/) — the one after a given segment.
- [`setSelection`](../../input-state/set-selection/) (input-state) — move the cursor.
