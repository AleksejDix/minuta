---
title: clearSegment
description: Empty one segment of a date, so 31.03.2026 becomes 31.__.2026.
---

Empty one segment and leave the rest alone, so clearing the month of
`31.03.2026` gives `31.__.2026`.

```ts
import { clearSegment } from "datefield";
```

```ts
clearSegment(segments, activeIndex);
```

## Example

```ts
import {
  clearSegment,
  deriveFormat,
  parseSegments,
  segmentsToString,
} from "datefield";

const segments = parseSegments(deriveFormat("de-CH"), "31.03.2026");
// index:   0 = day, 1 = ".", 2 = month, 3 = ".", 4 = year

segmentsToString(clearSegment(segments, 2)); // → "31.__.2026"
```

## Parameters

| Name          | What it is                                                                                   |
| ------------- | -------------------------------------------------------------------------------------------- |
| `segments`    | The current segments, from [`parseSegments`](../parse-segments/).                            |
| `activeIndex` | The index of the segment to clear, e.g. from [`segmentAtPosition`](../segment-at-position/). |

## Returns

New segments with every character of that segment replaced by `_`. When
`activeIndex` points at a separator or a display-only part, the same segments
come back unchanged.

## Clear the segment under the cursor

Write the result back into the field with [`withSegments`](../with-segments/).
The cursor stays where it was.

```ts
const segments = parseSegments(format, field.buffer.text);
const index = segmentAtPosition(segments, field.buffer.selection.head);
field = withSegments(field, clearSegment(segments, index));
```

Backspace and Delete in a masked field empty one slot at a time; this empties
a whole segment at once, for example on a "clear" key.

:::note
`clearSegment` always writes `_`. If you gave [`dateMask`](../date-mask/)
another placeholder character, the cleared segment will not match it.
:::

## Related

- [`withSegments`](../with-segments/) — put the result into the field.
- [`segmentAtPosition`](../segment-at-position/) — find the segment to clear.
- [`backspace`](../../input-state/backspace/) (input-state) — empty one slot.
