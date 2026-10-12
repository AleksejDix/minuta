---
title: clampDay
description: Keep the day within the month's real length, so 31.02.2026 becomes 28.02.2026 — without getting in the way while the user types.
---

Keep the day within the month's real length, so `31.02.2026` becomes
`28.02.2026`. With the cursor, it waits until the user has finished typing the
part they are in.

```ts
import { clampDay } from "datefield";
```

```ts
clampDay(segments, cursor?)
```

## Example

```ts
import {
  clampDay,
  deriveFormat,
  parseSegments,
  segmentsToString,
} from "datefield";

const format = deriveFormat("de-CH");
const s = (text) => parseSegments(format, text);

segmentsToString(clampDay(s("31.02.2026"))); // → "28.02.2026"
segmentsToString(clampDay(s("31.02.2024"))); // → "29.02.2024"   leap year
segmentsToString(clampDay(s("31.04.2026"))); // → "30.04.2026"
segmentsToString(clampDay(s("15.02.2026"))); // → "15.02.2026"   fine as it is
```

## Parameters

| Name       | What it is                                                                                                     |
| ---------- | -------------------------------------------------------------------------------------------------------------- |
| `segments` | The field's segments, from [`parseSegments`](../parse-segments/).                                              |
| `cursor`   | Optional. The cursor position after the edit, `field.buffer.selection.head`. Leave it out to clamp right away. |

## Returns

The segments with the day cut to the last day of the month, when it was too
large. When nothing needs to change, the very same segments come back, so
[`withSegments`](../with-segments/) leaves the field untouched.

## Why the cursor matters

Say the field holds `31.12.2026` and the user wants March. They put the cursor
on the month and type `0`, `3`. After the `0`, the month reads `02` for a
moment. Clamping then would cut the day to `28`, and after the `3` the date
would be `28.03.2026` — not what anyone typed.

With the cursor, `clampDay` does nothing while the cursor is still inside the
day, month or year being typed (past its first slot, before its end). It clamps
once the cursor has left that part:

```ts
clampDay(s("31.02.2026"), 4); // cursor inside the month → "31.02.2026", unchanged
clampDay(s("31.02.2026"), 6); // cursor has left the month → "28.02.2026"
clampDay(s("31.02.20__"), 8); // cursor inside the year → unchanged
```

So pass the cursor after every edit, and leave it out when the user is done,
for example on blur:

```ts
// after every change
field = withSegments(
  field,
  clampDay(
    parseSegments(format, field.buffer.text),
    field.buffer.selection.head
  )
);

// on blur
field = withSegments(field, clampDay(parseSegments(format, field.buffer.text)));
```

With [`attachInput`](../../input-dom/attach-input/), the first one is the
`normalize` option.

## While parts are missing

`clampDay` only cuts when it can be sure:

- An empty or half-typed day is left alone.
- While the month is empty, every day up to 31 is fine: `31.__.2026` stays.
- While the year is empty, February allows 29: `30.02.____` becomes
  `29.02.____`.
- An impossible month, like `13`, allows up to 31.
- Day `00` is not changed. [`toDate`](../to-date/) returns `undefined` for it.

Two-digit years follow the same rule as [`toDate`](../to-date/): `29.02.24`
is a leap day, `29.02.25` becomes `28.02.25`.

## Related

- [`rotateSegment`](../rotate-segment/) — arrow keys; clamps the day itself.
- [`withSegments`](../with-segments/) — write the result back into the field.
- [`toDate`](../to-date/) — read the date once it is valid.
