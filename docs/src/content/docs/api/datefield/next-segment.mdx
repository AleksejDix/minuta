---
title: nextSegment
description: The index of the next segment you can type into, skipping separators.
---

Find the next segment you can type into, skipping separators: after the day of
`31.03.2026` comes the month.

```ts
import { nextSegment } from "datefield";
```

```ts
nextSegment(segments, current);
```

## Example

```ts
import { deriveFormat, nextSegment, parseSegments } from "datefield";

const segments = parseSegments(deriveFormat("de-CH"), "31.03.2026");
// index:   0 = day, 1 = ".", 2 = month, 3 = ".", 4 = year

nextSegment(segments, 0); // → 2   day → month
nextSegment(segments, 2); // → 4   month → year
nextSegment(segments, 4); // → 4   the year is last: stays
```

## Parameters

| Name       | What it is                                                        |
| ---------- | ----------------------------------------------------------------- |
| `segments` | The field's segments, from [`parseSegments`](../parse-segments/). |
| `current`  | The index of the segment you are in.                              |

## Returns

The index of the first editable segment (day, month, year, hour, minute or
second) after `current`. Separators and display-only parts, like a weekday,
are skipped. When there is none, `current` comes back: it does not wrap around
to the first segment.

## Move the cursor to the next segment

The index is not a cursor position. Use the segment's `start`:

```ts
import { setSelection } from "input-state";

const segments = parseSegments(format, field.buffer.text);
const here = segmentAtPosition(segments, field.buffer.selection.head);
const next = segments[nextSegment(segments, here)];
field = setSelection(field, next.start);
```

[`typeDate`](../type-date/) already jumps to the next segment when one is full
or a separator is typed.

## Related

- [`previousSegment`](../previous-segment/) — the other direction.
- [`segmentAtPosition`](../segment-at-position/) — the segment under the cursor.
- [`firstEditableIndex`](../first-editable-index/) and [`lastEditableIndex`](../last-editable-index/).
