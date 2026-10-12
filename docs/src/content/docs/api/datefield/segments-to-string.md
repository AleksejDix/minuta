---
title: segmentsToString
description: Join segments back into the date text, such as 31.03.2026.
---

Join segments back into text: the values of all parts, one after another, so
the segments of `31.03.2026` give `"31.03.2026"` again.

```ts
import { segmentsToString } from "datefield";
```

```ts
segmentsToString(segments);
```

## Example

```ts
import { deriveFormat, fromDate, segmentsToString } from "datefield";

const format = deriveFormat("de-CH");

segmentsToString(fromDate(new Date(2026, 2, 1), format)); // → "01.03.2026"
segmentsToString(fromDate(new Date(2026, 2, 1), deriveFormat("en-US"))); // → "03/01/2026"
segmentsToString(fromDate(new Date(2026, 2, 1), deriveFormat("ko-KR"))); // → "2026. 03. 01."
```

## Parameters

| Name       | What it is                                                                                          |
| ---------- | --------------------------------------------------------------------------------------------------- |
| `segments` | Segments, from [`parseSegments`](../parse-segments/), [`fromDate`](../from-date/) or after an edit. |

## Returns

One string: every segment's `value`, in order. Positions are not checked; the
values are simply joined.

## Show a date in a new field

Use it with `fromDate` to start a field with a value:

```ts
import { dateMask, deriveFormat, fromDate, segmentsToString } from "datefield";
import { createInputState } from "input-state";

const format = deriveFormat("de-CH");
const field = createInputState({
  mask: dateMask(format),
  value: segmentsToString(fromDate(new Date(2026, 2, 31), format)),
});

field.buffer.text; // → "31.03.2026"
```

To put changed segments into an existing field, use
[`withSegments`](../with-segments/) instead. It calls `segmentsToString` and
keeps the cursor where it was.

## Related

- [`parseSegments`](../parse-segments/) — the other direction: text to segments.
- [`withSegments`](../with-segments/) — write segments into a field.
- [`fromDate`](../from-date/) — segments from a `Date`.
