---
title: select
description: Set the selection of a text buffer, or place a cursor.
---

Select part of the text, or place the cursor at one position.

```ts
import { select } from "text-buffer";
```

```ts
select(buffer, anchor, head?)
```

## Example

```ts
import { createTextBuffer, select } from "text-buffer";

const buffer = createTextBuffer("hello world");

select(buffer, 0, 5);
// → "hello" selected: { anchor: 0, head: 5 }

select(buffer, 4);
// → a cursor at 4: { anchor: 4, head: 4 }
```

## Parameters

| Name     | What it is                                                                                |
| -------- | ----------------------------------------------------------------------------------------- |
| `buffer` | The buffer to change.                                                                     |
| `anchor` | The fixed end of the selection: where the user started selecting.                         |
| `head`   | Optional. The moving end, where the caret is. Leave it out to place a cursor at `anchor`. |

## Returns

A new buffer with the same text and the new selection. When the selection is
already exactly that, you get the same buffer back.

```ts
const end = createTextBuffer("hello world"); // cursor at 11
select(end, 11) === end; // → true
```

## Backward selections

Pass a `head` smaller than `anchor` to select backwards, as when the user
drags from right to left or holds Shift and presses the left arrow. The
selected text is the same; only the caret side differs.

```ts
select(buffer, 5, 0);
// → "hello" selected, caret at 0: { anchor: 5, head: 0 }
```

## Positions are clamped

Positions below 0 become 0, positions past the end become the end of the text.

## Related

- [`moveCursor`](../move-cursor/) — move the cursor by a number of characters.
- [`selectionStart`](../selection-start/) and [`selectionEnd`](../selection-end/) — the edges of the selection.
- [`isCollapsed`](../is-collapsed/) — whether the selection is just a cursor.
- [`setSelection`](../../input-state/set-selection/) — the same for an input state.
