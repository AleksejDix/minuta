---
title: lastEditableIndex
description: The index of the last segment you can type into, such as the year in de-CH or the day in ja-JP.
---

Find the last segment you can type into: the year in `de-CH` and `en-US`, the
day in `ja-JP`.

```ts
import { lastEditableIndex } from "datefield";
```

```ts
lastEditableIndex(segments);
```

## Example

```ts
import { deriveFormat, lastEditableIndex, parseSegments } from "datefield";

lastEditableIndex(parseSegments(deriveFormat("de-CH"), "31.03.2026"));
// → 4   the year

lastEditableIndex(parseSegments(deriveFormat("ko-KR"), "2026. 03. 31."));
// → 4   the day; the "." after it is a separator
```

## Parameters

| Name       | What it is                                                                           |
| ---------- | ------------------------------------------------------------------------------------ |
| `segments` | Segments, from [`parseSegments`](../parse-segments/) or [`fromDate`](../from-date/). |

## Returns

The index of the last day, month, year, hour, minute or second segment.
Separators and display-only parts are skipped. `-1` when there is no editable
segment.

[`segmentAtPosition`](../segment-at-position/) falls back to this segment when
the cursor is not in any segment.

Use it to put the cursor at the end of the last segment, for example on the
End key:

```ts
const segments = parseSegments(format, field.buffer.text);
field = setSelection(field, segments[lastEditableIndex(segments)].end);
```

## Related

- [`firstEditableIndex`](../first-editable-index/) — the first one.
- [`previousSegment`](../previous-segment/) — the one before a given segment.
