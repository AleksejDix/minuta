---
title: parseSegments
description: Cut the text of a date field into its segments — day, separator, month, separator, year.
---

Cut the text of a date field into its parts, so `31.03.2026` becomes day `31`,
separator `.`, month `03`, separator `.`, year `2026`, each with its position.

```ts
import { parseSegments } from "datefield";
```

```ts
parseSegments(format, text);
```

## Example

```ts
import { deriveFormat, parseSegments } from "datefield";

const format = deriveFormat("de-CH");

parseSegments(format, "31.03.2026");
// → [
//     { type: "day",     value: "31",   start: 0, end: 2 },
//     { type: "literal", value: ".",    start: 2, end: 3 },
//     { type: "month",   value: "03",   start: 3, end: 5 },
//     { type: "literal", value: ".",    start: 5, end: 6 },
//     { type: "year",    value: "2026", start: 6, end: 10 },
//   ]
```

## Parameters

| Name     | What it is                                                      |
| -------- | --------------------------------------------------------------- |
| `format` | The format from [`deriveFormat`](../derive-format/).            |
| `text`   | The text to cut, usually the field's text, `field.buffer.text`. |

## What a segment is

A segment is one part of the date text:

| Field   | Meaning                                                                                         |
| ------- | ----------------------------------------------------------------------------------------------- |
| `type`  | `"day"`, `"month"`, `"year"`, `"hour"`, `"minute"`, `"second"`, or `"literal"` for a separator. |
| `value` | The characters of this part, exactly as they are in the text.                                   |
| `start` | The position where the part starts in the text.                                                 |
| `end`   | The position right after its last character.                                                    |

Positions are the same numbers as the cursor position, so a cursor at `4` is
inside the month (`3` to `5`). [`segmentAtPosition`](../segment-at-position/)
does that lookup for you.

The functions that navigate, rotate, clamp and convert all work on this list.
Cut the current text, change the segments, then write them back with
[`withSegments`](../with-segments/).

## Returns

A new list of segments, one for every part of the format, in order.

## It cuts, it does not check

`parseSegments` does not read or validate anything. It cuts the text at the
positions the format says, and copies what is there. Empty slots and
impossible values stay as they are:

```ts
parseSegments(format, "3_.__.____")[0].value; // → "3_"
parseSegments(format, "99.99.9999")[0].value; // → "99"
```

Text that is shorter than the format gives empty values at the end. Field text
from a [`dateMask`](../date-mask/) always has the full length, so this only
happens with text from elsewhere.

To read the date out of the segments, use [`toDate`](../to-date/).

## Related

- [`segmentsToString`](../segments-to-string/) — join segments back into text.
- [`toDate`](../to-date/) — read a `Date` from the segments.
- [`fromDate`](../from-date/) — build segments from a `Date`.
- [`withSegments`](../with-segments/) — write changed segments back into the field.
