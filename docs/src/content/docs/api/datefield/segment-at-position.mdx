---
title: segmentAtPosition
description: Find which segment — day, month or year — the cursor is in.
---

Find the segment the cursor is in, so a cursor at position 4 of `31.03.2026`
is in the month. Use it to know which segment an arrow key should change.

```ts
import { segmentAtPosition } from "datefield";
```

```ts
segmentAtPosition(segments, cursorPos);
```

## Example

```ts
import { deriveFormat, parseSegments, segmentAtPosition } from "datefield";

const segments = parseSegments(deriveFormat("de-CH"), "31.03.2026");
// index:   0 = day, 1 = ".", 2 = month, 3 = ".", 4 = year

segmentAtPosition(segments, 0); // → 0   day
segmentAtPosition(segments, 4); // → 2   month
segmentAtPosition(segments, 8); // → 4   year
```

## Parameters

| Name        | What it is                                                                 |
| ----------- | -------------------------------------------------------------------------- |
| `segments`  | The field's segments, from [`parseSegments`](../parse-segments/).          |
| `cursorPos` | A position in the text, usually the cursor: `field.buffer.selection.head`. |

## Returns

The **index** of the segment in the list, not a position in the text. Pass it
to [`rotateSegment`](../rotate-segment/), [`clearSegment`](../clear-segment/)
or [`inputDigit`](../input-digit/).

Only editable segments (day, month, year, hour, minute, second) are found.
Separators and display-only parts like a weekday are skipped.

## Positions at the edges

A segment covers its `start` up to and including its `end`, so a cursor right
after the last digit still belongs to it. Where two segments touch, the earlier
one wins.

| Cursor in `31.03.2026` | Segment |
| ---------------------- | ------- |
| `0`, `1`, `2`          | day     |
| `3`, `4`, `5`          | month   |
| `6` … `10`             | year    |

When the position is in no editable segment, for example past the end or
negative, the **last** editable segment is returned:

```ts
segmentAtPosition(segments, 11); // → 4   year
segmentAtPosition(segments, -1); // → 4   year
```

It returns `-1` only when there is no editable segment at all.

## Arrow keys

The usual pattern: cut the text, find the segment under the cursor, rotate it,
write it back.

```ts
const segments = parseSegments(format, field.buffer.text);
const index = segmentAtPosition(segments, field.buffer.selection.head);
field = withSegments(field, rotateSegment(segments, index, 1));
```

## Related

- [`nextSegment`](../next-segment/) and [`previousSegment`](../previous-segment/) — move between segments.
- [`rotateSegment`](../rotate-segment/) — step the segment up or down.
- [`parseSegments`](../parse-segments/) — get the segments.
