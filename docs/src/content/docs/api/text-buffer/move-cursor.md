---
title: moveCursor
description: Move the cursor left or right, like the arrow keys in a text field.
---

Move the cursor a number of positions to the left or right, the way the arrow
keys do.

```ts
import { moveCursor } from "text-buffer";
```

```ts
moveCursor(buffer, offset);
```

## Example

```ts
import { createTextBuffer, moveCursor } from "text-buffer";

const buffer = createTextBuffer("hello", { anchor: 2, head: 2 });

moveCursor(buffer, 1);
// → cursor at 3

moveCursor(buffer, -99);
// → cursor at 0 (it stops at the start)
```

## Parameters

| Name     | What it is                                                  |
| -------- | ----------------------------------------------------------- |
| `buffer` | The buffer to change.                                       |
| `offset` | How far to move. Positive moves right, negative moves left. |

## Returns

A new buffer with a cursor at the new position. The text does not change.
When the cursor cannot move, for example right at the end of the text, you get
the same buffer back.

## A selection collapses instead of moving

When text is selected, the arrow keys do not move the caret. They drop the
selection on one side. `moveCursor` does the same:

- A negative `offset` puts the cursor at the left edge of the selection.
- A zero or positive `offset` puts it at the right edge.

The size of `offset` does not matter here, and it does not matter whether the
selection is backward.

```ts
const selected = createTextBuffer("hello", { anchor: 1, head: 4 }); // "ell"

moveCursor(selected, -1); // → cursor at 1
moveCursor(selected, 1); // → cursor at 4
```

## Positions are code units

`offset` counts UTF-16 code units, not characters as users see them. An emoji
such as 😀 takes two units, so moving by 1 can land in the middle of it.
[`deleteBackward`](../delete-backward/) and
[`deleteForward`](../delete-forward/) do remove whole characters.

## Related

- [`select`](../select/) — place the cursor at an exact position.
- [`selectionStart`](../selection-start/) and [`selectionEnd`](../selection-end/) — the edges a selection collapses to.
