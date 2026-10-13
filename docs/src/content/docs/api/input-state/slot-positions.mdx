---
title: slotPositions
description: The positions in the text where a mask has slots the user can fill.
---

Get the positions in the field's text that are slots, in order from left to
right. Every other position is a literal.

```ts
import { slotPositions } from "input-state";
```

```ts
slotPositions(mask);
```

## Example

```ts
import { parseMask, slotPositions } from "input-state";

slotPositions(parseMask("99.99.9999"));
// → [0, 1, 3, 4, 6, 7, 8, 9]   (2 and 5 are the dots)

slotPositions(parseMask("AAA-999"));
// → [0, 1, 2, 4, 5, 6]
```

## Parameters

| Name   | What it is                                 |
| ------ | ------------------------------------------ |
| `mask` | A mask from [`parseMask`](../parse-mask/). |

## Returns

A new array of positions. Each one is an index into the field's text, so
`field.buffer.text[position]` is what that slot holds right now.

```ts
const slots = slotPositions(mask);
const typed = slots.map((position) => field.buffer.text[position]).join("");
// → "31032026" for "31.03.2026"
```

## Related

- [`emptyText`](../empty-text/) — the text these positions point into.
- [`isComplete`](../is-complete/) — whether every slot is filled.
