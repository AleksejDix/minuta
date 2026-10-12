---
title: setSelection
description: Move the cursor of an input field, or select part of its text.
---

Move the cursor, or select part of the text. Use it when the user clicks into
the field or selects with the mouse or Shift and the arrow keys.

```ts
import { setSelection } from "input-state";
```

```ts
setSelection(state, anchor, head?)
```

## Example

```ts
import { createInputState, parseMask, setSelection } from "input-state";

const field = createInputState({ mask: parseMask("99.99.9999") });

setSelection(field, 3); // → cursor at 3, the first month slot
setSelection(field, 0, 5); // → "__.__" selected
setSelection(field, 99); // → cursor at 10, the end
```

## Parameters

| Name     | What it is                                                                           |
| -------- | ------------------------------------------------------------------------------------ |
| `state`  | The field to change.                                                                 |
| `anchor` | The fixed end of the selection: where the user started selecting.                    |
| `head`   | Optional. The moving end, where the caret is. Leave it out for a cursor at `anchor`. |

A `head` smaller than `anchor` is a backward selection, made from right to
left. Positions outside the text are clamped to its start or end.

## Returns

A new state with the new selection. The text, mask and mode do not change.
When the selection is already exactly that, you get the same state back.

## The cursor may sit on a literal

`setSelection` does not snap the cursor to a slot. That is fine: the next
[`typeChar`](../type-char/) fills the next slot after the cursor, and
[`backspace`](../backspace/) empties the slot before it.

## Related

- [`select`](../../text-buffer/select/) — the same on a plain text buffer.
- [`typeChar`](../type-char/) — type at the new position.
