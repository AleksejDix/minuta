---
title: visibleRange
description: The part of the text an <input> should select to show a state — its selection, or a one-character block cursor in overwrite mode.
---

Work out what the element should select to show a state: the selection as it
is, or, in overwrite mode, a one-character block over the slot the next key
will fill.

```ts
import { visibleRange } from "input-dom";
```

```ts
visibleRange(state);
```

## Example

```ts
import { createInputState, parseMask, setSelection } from "input-state";
import { visibleRange } from "input-dom";

const empty = createInputState({ mask: parseMask("99.99.9999") });
visibleRange(empty);
// → { start: 0, end: 1, direction: "forward" }   block over the first slot

const range = visibleRange(empty);
element.setSelectionRange(range.start, range.end, range.direction);
```

## Parameters

| Name    | What it is               |
| ------- | ------------------------ |
| `state` | The input state to show. |

## Returns

An object with `start`, `end` and `direction`, ready for the element's
`setSelectionRange(start, end, direction)`.

| State                                    | Shown as                                |
| ---------------------------------------- | --------------------------------------- |
| A selection from left to right           | that selection, `"forward"`             |
| A selection from right to left (Shift+←) | that selection, `"backward"`            |
| A cursor in insert mode                  | a cursor (`start` = `end`)              |
| A cursor in overwrite mode               | the one character after it, `"forward"` |
| A cursor in overwrite mode at the end    | a cursor: there is nothing to cover     |

```ts
const text = createInputState({ value: "hello" });

visibleRange(setSelection(text, 1, 4)); // → { start: 1, end: 4, direction: "forward" }
visibleRange(setSelection(text, 4, 1)); // → { start: 1, end: 4, direction: "backward" }
visibleRange(text); // → { start: 5, end: 5, direction: "forward" }

const overwrite = setSelection(
  createInputState({ mode: "overwrite", value: "abc" }),
  1
);
visibleRange(overwrite); // → { start: 1, end: 2, direction: "forward" }
```

## Why a block

A masked field is always in overwrite mode: typing replaces the slot at the
cursor. A thin caret between characters does not say which slot that is. A
one-character selection does, the way a block cursor does in a terminal.

The state itself keeps a plain cursor. Only the element shows the block.
[`attachInput`](../attach-input/) knows that, and does not mistake the block
for a selection the user made.

## Related

- [`attachInput`](../attach-input/) — renders with this after every change.
- [`applyInputEvent`](../apply-input-event/) — the other half of a custom binding.
- [`setSelection`](../../input-state/set-selection/) (input-state) — set the cursor or selection.
