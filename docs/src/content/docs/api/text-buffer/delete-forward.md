---
title: deleteForward
description: The Delete key — delete the selection, or the character after the cursor.
---

Do what the Delete key does: delete the selected text, or the character after
the cursor.

```ts
import { deleteForward } from "text-buffer";
```

```ts
deleteForward(buffer);
```

## Example

```ts
import { createTextBuffer, deleteForward } from "text-buffer";

deleteForward(createTextBuffer("hello", { anchor: 0, head: 0 }));
// → "ello", cursor at 0

deleteForward(createTextBuffer("hello", { anchor: 4, head: 1 }));
// → "ho", cursor at 1 (a backward selection of "ell")
```

## Parameters

| Name     | What it is            |
| -------- | --------------------- |
| `buffer` | The buffer to change. |

## Returns

A new buffer with the text removed. The cursor stays where it was (or at the
left edge of the removed selection). At the very end of the text there is
nothing after the cursor, so you get the same buffer back.

```ts
const end = createTextBuffer("hello"); // cursor at 5
deleteForward(end) === end; // → true
```

## Whole characters go at once

Like [`deleteBackward`](../delete-backward/), one press removes one character
as people see it: a whole emoji sequence, flag, or letter with its accent.

```ts
deleteForward(createTextBuffer("👨‍👩‍👧!", { anchor: 0, head: 0 }));
// → "!"
```

## Related

- [`deleteBackward`](../delete-backward/) — Backspace.
- [`deleteForward`](../../input-state/delete-forward/) in input-state — Delete in a masked field.
