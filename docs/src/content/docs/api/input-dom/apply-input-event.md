---
title: applyInputEvent
description: Turn one browser beforeinput event into the next input state — typing, pasting, dropping or deleting.
---

Turn one `beforeinput` event into the next state: a typed `3` fills the next
slot, a paste goes through your `insert` function, Backspace empties a slot.
It is the core step of [`attachInput`](../attach-input/), exported for building
your own binding.

```ts
import { applyInputEvent } from "input-dom";
```

```ts
applyInputEvent(state, event, insert?)
```

## Example

```ts
import { applyInputEvent } from "input-dom";
import { createInputState, parseMask } from "input-state";

const state = createInputState({ mask: parseMask("99.99.9999") });

element.addEventListener("beforeinput", (event) => {
  event.preventDefault();
  const next = applyInputEvent(state, event);
  // a typed "3"      → next.buffer.text is "3_.__.____"
  // undo, bold, …    → next is undefined
});
```

## Parameters

| Name     | What it is                                                                                                                                     |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `state`  | The current input state.                                                                                                                       |
| `event`  | A `beforeinput` event from the element.                                                                                                        |
| `insert` | Optional. How text is applied: gets the state and the text, returns the new state. Default: input-state's [`paste`](../../input-state/paste/). |

## Returns

The next state, or `undefined` when the kind of input is not handled. It does
not touch the element and does not cancel the event; that is up to you.

## Which events do what

The event's `inputType` decides:

| `inputType`                                                                | What happens                                |
| -------------------------------------------------------------------------- | ------------------------------------------- |
| `insertText`, `insertReplacementText`, `insertFromPaste`, `insertFromDrop` | The text goes through `insert`.             |
| `deleteContentBackward`, `deleteWordBackward`, `deleteByCut`               | [`backspace`](../../input-state/backspace/) |
| `deleteContentForward`, `deleteWordForward`                                | `deleteForward`                             |
| anything else (undo, redo, line breaks, formatting, …)                     | `undefined`                                 |

The text is the event's `data`, or for a drop, the plain text being dropped.

Deleting a word deletes the same as one Backspace or Delete. With a mask that
empties one slot (or the selection); nothing shifts.

## Dates

Pass datefield's [`typeDate`](../../datefield/type-date/) as `insert`, so
separators finish a segment and pastes are read as dates:

```ts
import { dateMask, deriveFormat, typeDate } from "datefield";

const format = deriveFormat("de-CH");
const field = createInputState({ mask: dateMask(format) });
const insert = (state, text) => typeDate(format, state, text);

const pasteEvent = new InputEvent("beforeinput", {
  inputType: "insertFromPaste",
  data: "1.3.2026",
});

applyInputEvent(field, pasteEvent).buffer.text; // → "13.20.26__"   plain paste
applyInputEvent(field, pasteEvent, insert).buffer.text; // → "01.03.2026"
```

## Related

- [`attachInput`](../attach-input/) — the full binding that uses this.
- [`visibleRange`](../visible-range/) — how to show the state's selection.
- [`paste`](../../input-state/paste/) (input-state) — the default `insert`.
