---
title: input-dom
description: Bind a real <input> element to an input state — keyboard, paste, drop and selection in, text and cursor out.
sidebar:
  order: 0
  label: Overview
---

input-dom connects a real `<input>` element to an input state. Key presses,
pastes, drops and mouse selections go in; the text and the cursor come out.
The element never edits itself: every change goes through the state's rules,
so a mask like `__.__.____` cannot be broken by typing, pasting or autocorrect.

```bash
npm install input-dom input-state text-buffer
```

## Where it sits

input-dom is the top layer of the [input stack](../../../concepts/the-input-stack/):

1. [text-buffer](../../text-buffer/overview/) — text and a cursor.
2. [input-state](../../input-state/overview/) — modes and masks.
3. [datefield](../../datefield/overview/) — date rules on top of a mask.
4. **input-dom** — the only layer that knows about the DOM.

It is small on purpose. All decisions — what a key does, how a paste is read,
when a day is clamped — live in the layers below as pure functions, and
input-dom calls them. React and Vue wrap it in a few lines.

## Example: a date field

A complete `de-CH` date input. People can type `1.3.2026`, paste
`31. März 2026` or `2026-03-31`, step segments with the arrow keys, and never
end up with 31 February.

```html
<input id="date" inputmode="numeric" autocomplete="off" />
```

```ts
import {
  clampDay,
  dateMask,
  dateOrder,
  deriveFormat,
  parseSegments,
  rotateSegment,
  segmentAtPosition,
  toDate,
  typeDate,
  withSegments,
} from "datefield";
import { attachInput } from "input-dom";
import { createInputState } from "input-state";
import { parseDate } from "fechita";

const locale = "de-CH";
const format = deriveFormat(locale); // __.__.____
const element = document.querySelector("#date");

// Read pasted dates in any form, in the order the field shows
function parse(text) {
  const result = parseDate(text, { locale, order: dateOrder(format) });
  return result.valid ? result.date : undefined;
}

// ArrowUp / ArrowDown step the segment under the cursor
function rotated(state, key) {
  if (key !== "ArrowUp" && key !== "ArrowDown") return undefined;
  const segments = parseSegments(format, state.buffer.text);
  const index = segmentAtPosition(segments, state.buffer.selection.head);
  return withSegments(
    state,
    rotateSegment(segments, index, key === "ArrowUp" ? 1 : -1)
  );
}

const controller = attachInput(
  element,
  createInputState({ mask: dateMask(format) }),
  {
    // typing and pasting the way people write dates
    insert: (state, text) => typeDate(format, state, text, { parse }),
    // 31.02 → 28.02, once the cursor has left the part being typed
    normalize: (state) =>
      withSegments(
        state,
        clampDay(
          parseSegments(format, state.buffer.text),
          state.buffer.selection.head
        )
      ),
    onKeyDown: (event, state) => rotated(state, event.key),
    onChange: (state) => {
      const date = toDate(parseSegments(format, state.buffer.text));
      console.log(date ?? "not a complete date yet");
    },
  }
);
```

What the user sees:

| The user…                                          | The field shows |
| -------------------------------------------------- | --------------- |
| focuses the empty field                            | `__.__.____`    |
| types `1.3.2026`                                   | `01.03.2026`    |
| pastes `2026-03-31`                                | `31.03.2026`    |
| puts the cursor on the day, ArrowUp                | `01.03.2026`    |
| puts the cursor on the month, ArrowUp from `31.03` | `30.04.2026`    |

Call `controller.destroy()` when the element goes away.

## Functions

| Function                                   | What it does                                                     |
| ------------------------------------------ | ---------------------------------------------------------------- |
| [`attachInput`](../attach-input/)          | Bind an `<input>` to a state; returns a controller.              |
| [`applyInputEvent`](../apply-input-event/) | Turn one `beforeinput` event into the next state.                |
| [`visibleRange`](../visible-range/)        | What the element selects to show a state, block cursor included. |

`attachInput` is all most apps need. The other two are for writing a binding
of your own.

## How it works

- Every `beforeinput` event is cancelled and applied to the state instead.
  The state is then shown in the element. Because the browser never edits the
  text, mobile keyboards, autocorrect and drag-and-drop all follow the mask.
- In overwrite mode the cursor is shown as a one-character selection, the slot
  the next key fills. ArrowLeft, ArrowRight, Home and End move it; with Shift
  or another modifier the browser handles the key.
- The controller owns the state. Read it with `getState()` or in `onChange`,
  replace it with `setState()`.
- To show a locale's digits, pass `digits: localeDigits(locale)` from
  datefield. The element shows `٣١‏/٠٣‏/٢٠٢٦` while the state keeps
  `31‏/03‏/2026`.
