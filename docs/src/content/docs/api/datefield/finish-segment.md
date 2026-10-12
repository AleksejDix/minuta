---
title: finishSegment
description: Finish the half-typed segment at the cursor — pad it with zeros and move on, so 1 becomes 01.
---

Finish the segment the cursor is in: pad what was typed with zeros and move the
cursor to the next segment, so a day of `1_` becomes `01`.

```ts
import { finishSegment } from "datefield";
```

```ts
finishSegment(format, state);
```

## Example

```ts
import { dateMask, deriveFormat, finishSegment, typeDate } from "datefield";
import { createInputState } from "input-state";

const format = deriveFormat("de-CH");
let field = createInputState({ mask: dateMask(format) });

for (const key of "1.3.5") field = typeDate(format, field, key);
field.buffer.text; // → "01.03.5___"

field = finishSegment(format, field);
field.buffer.text; // → "01.03.2005"
```

## Parameters

| Name     | What it is                                                    |
| -------- | ------------------------------------------------------------- |
| `format` | The field's format, from [`deriveFormat`](../derive-format/). |
| `state`  | The field. Its cursor says which segment to finish.           |

## Returns

A new field with the segment finished and the cursor at the start of the next
segment (or right after the last segment). When there is nothing
to finish, the same field comes back unchanged.

## When there is something to finish

The cursor must be inside a day, month, year, hour, minute or second, after its
first slot and before its end, and everything before the cursor in that segment
must be digits. Then those digits are padded on the left with zeros:

```ts
// cursor after "1" in "1_.__.____"
finishSegment(format, field); // → "01.__.____", cursor at the month
```

Nothing happens when the cursor is at the start of a segment, at its end
(the segment is full) or on a separator. That is why a `.` typed right after
the automatic jump does not skip a segment. Only the cursor end of a selection
(its `head`) is looked at.

## Two-digit years

A year finished with one or two digits stands for a year from 80 years ago to
19 years ahead (in 2026: 1946 to 2045). Three digits are taken as written.

| Typed year | Finished |
| ---------- | -------- |
| `5`        | `2005`   |
| `26`       | `2026`   |
| `46`       | `1946`   |
| `202`      | `0202`   |

## Call it on blur

[`typeDate`](../type-date/) calls `finishSegment` for you whenever a separator
is typed, and at the end of a paste. The last segment has no separator after
it, so when the user types `1.3.26` and tabs away, the year still reads
`26__`. Finish it when the field loses focus:

```ts
element.addEventListener("blur", () => {
  controller.setState(finishSegment(format, controller.getState()));
});
```

`controller` here is the one [`attachInput`](../../input-dom/attach-input/)
returns. `setState` does not call `onChange`, so update anything that mirrors
the field yourself.

:::caution
In a field with a two-digit year segment (`year: "2-digit"`), finishing a
one-digit year writes four digits (`5` → `2005`) and makes the text longer
than the field. Avoid finishing the year in such fields until this is fixed.
:::

## Related

- [`typeDate`](../type-date/) — typing that calls this on every separator.
- [`clampDay`](../clamp-day/) — keep the day valid; also useful on blur.
- [`setSelection`](../../input-state/set-selection/) (input-state) — move the cursor yourself.
