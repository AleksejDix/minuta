---
title: backspace
description: The Backspace key for an input field; in a masked field the previous slot empties and nothing shifts.
---

Do what the Backspace key does. In a masked field the slot before the cursor
becomes empty again and nothing moves; in a free-text field the character
before the cursor is removed.

```ts
import { backspace } from "input-state";
```

```ts
backspace(state);
```

## Example

```ts
import {
  backspace,
  createInputState,
  parseMask,
  setSelection,
} from "input-state";

let field = createInputState({
  mask: parseMask("99.99.9999"),
  value: "31032026",
});

field = backspace(field); // → "31.03.202_", cursor at 9
field = backspace(field); // → "31.03.20__", cursor at 8
```

## Parameters

| Name    | What it is           |
| ------- | -------------------- |
| `state` | The field to change. |

## Returns

A new state. When there is nothing to delete, for example at the start of
the field, you get the same state back.

## In a masked field

- The nearest slot before the cursor gets the placeholder, and the cursor
  moves onto it. Literals are skipped: with the cursor right after a `.`,
  the digit before the `.` is emptied.
- The rest of the text stays where it is. Fixing one digit never moves the
  other ones.
- With a selection, every slot in it is emptied and the cursor goes to the
  left edge.

```ts
const full = createInputState({
  mask: parseMask("99.99.9999"),
  value: "31032026",
});

backspace(setSelection(full, 3)); // → "3_.03.2026", cursor at 1
backspace(setSelection(full, 0, 5)); // → "__.__.2026", cursor at 0
```

## In a free-text field

It works like [`deleteBackward`](../../text-buffer/delete-backward/) in
text-buffer: the selection, or the character before the cursor, is removed.
A whole emoji or accented letter goes at once.

## Related

- [`deleteForward`](../delete-forward/) — the Delete key.
- [`typeChar`](../type-char/) — fill a slot again.
- [`deleteBackward`](../../text-buffer/delete-backward/) — Backspace on a plain text buffer.
