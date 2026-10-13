---
title: deleteForward
description: The Delete key for an input field; in a masked field the slot at the cursor empties and the cursor stays.
---

Do what the Delete key does. In a masked field the slot at the cursor becomes
empty and the cursor stays put; in a free-text field the character after the
cursor is removed.

```ts
import { deleteForward } from "input-state";
```

```ts
deleteForward(state);
```

## Example

```ts
import {
  createInputState,
  deleteForward,
  parseMask,
  setSelection,
} from "input-state";

const full = createInputState({
  mask: parseMask("99.99.9999"),
  value: "31032026",
});

deleteForward(setSelection(full, 3));
// → "31._3.2026", cursor still at 3
```

## Parameters

| Name    | What it is           |
| ------- | -------------------- |
| `state` | The field to change. |

## Returns

A new state. When there is nothing after the cursor to delete, for example at
the end of the field, you get the same state back.

## In a masked field

- The slot at the cursor, or the next slot after it, gets the placeholder.
  With the cursor right before a `.`, the digit after the `.` is emptied.
- The cursor does not move, so pressing Delete again empties the next slot.
- With a selection, every slot in it is emptied and the cursor goes to the
  left edge.

```ts
deleteForward(setSelection(full, 2));
// → "31._3.2026", cursor at 2 (before the ".")
```

## In a free-text field

It works like [`deleteForward`](../../text-buffer/delete-forward/) in
text-buffer: the selection, or the character after the cursor, is removed.

## Related

- [`backspace`](../backspace/) — the Backspace key.
- [`deleteForward`](../../text-buffer/delete-forward/) — Delete on a plain text buffer.
