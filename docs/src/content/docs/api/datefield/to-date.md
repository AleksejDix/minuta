---
title: toDate
description: Read the date out of a field's segments, or get undefined while it is incomplete or impossible.
---

Read the date the user typed: the segments of `31.03.2026` give
`new Date(2026, 2, 31)`. While a slot is empty, or the date does not exist,
you get `undefined`.

```ts
import { toDate } from "datefield";
```

```ts
toDate(segments);
```

## Example

```ts
import { deriveFormat, parseSegments, toDate } from "datefield";

const format = deriveFormat("de-CH");

toDate(parseSegments(format, "31.03.2026")); // → Tue Mar 31 2026 00:00 (local time)
toDate(parseSegments(format, "31.03.____")); // → undefined   (not finished)
toDate(parseSegments(format, "30.02.2026")); // → undefined   (no 30 February)
```

Read it from the field after every change:

```ts
const date = toDate(parseSegments(format, field.buffer.text));
```

## Parameters

| Name       | What it is                                                        |
| ---------- | ----------------------------------------------------------------- |
| `segments` | The field's segments, from [`parseSegments`](../parse-segments/). |

## Returns

A `Date` at local midnight, or `undefined`. You get `undefined` when:

- a day, month or year segment is not all digits — an empty or half-typed
  slot (`3_`);
- the day, month or year is missing from the format, such as a time-only
  field;
- the date does not exist: day `00`, month `13`, 31 April, 30 February, or
  29 February outside a leap year.

```ts
toDate(parseSegments(format, "29.02.2024")); // → Thu Feb 29 2024  (leap year)
toDate(parseSegments(format, "29.02.2025")); // → undefined
toDate(parseSegments(format, "00.01.2026")); // → undefined
```

`toDate` never changes what the user typed. To fix a day that is too large
for the month, use [`clampDay`](../clamp-day/).

## Times

When the format has hours, minutes or seconds, they are part of the date.
Missing ones count as zero.

```ts
const dateTime = deriveFormat("de-CH", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

toDate(parseSegments(dateTime, "01.03.2026, 09:05")); // → Sun Mar 01 2026 09:05
```

Weekday, era and other display-only segments are ignored.

## Years

A four-digit year is taken as written, also below 100: `01.01.0050` is the
year 50, not 1950.

A two-digit year (from `year: "2-digit"`) stands for the year in a window of
100 years: from 80 years ago to 19 years ahead. In 2026 that is 1946 to 2045.

```ts
const short = deriveFormat("de-CH", {
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
});

toDate(parseSegments(short, "31.03.26")); // → 2026-03-31
toDate(parseSegments(short, "31.03.45")); // → 2045-03-31
toDate(parseSegments(short, "31.03.46")); // → 1946-03-31
toDate(parseSegments(short, "31.03.99")); // → 1999-03-31
```

The window moves with today's date.

## Related

- [`fromDate`](../from-date/) — the other direction: a `Date` to segments.
- [`parseSegments`](../parse-segments/) — get the segments from the text.
- [`clampDay`](../clamp-day/) — turn 31.02 into 28.02 instead of `undefined`.
