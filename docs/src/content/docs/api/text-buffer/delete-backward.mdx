---
title: deleteBackward
description: Backspace — delete the selection, or the character before the cursor.
---

Do what Backspace does: delete the selected text, or the character before the
cursor.

```ts
import { deleteBackward } from "text-buffer";
```

```ts
deleteBackward(buffer);
```

## Example

```ts
import { createTextBuffer, deleteBackward } from "text-buffer";

deleteBackward(createTextBuffer("hello"));
// → "hell", cursor at 4

deleteBackward(createTextBuffer("hello", { anchor: 1, head: 3 }));
// → "hlo", cursor at 1 ("el" was selected)
```

## Parameters

| Name     | What it is            |
| -------- | --------------------- |
| `buffer` | The buffer to change. |

## Returns

A new buffer with the text removed and a cursor where it was. At the very
start of the text there is nothing before the cursor, so you get the same
buffer back.

```ts
const start = createTextBuffer("hello", { anchor: 0, head: 0 });
deleteBackward(start) === start; // → true
```

## Whole characters go at once

One Backspace removes one character as people see it, even when it is made of
several code units: emoji sequences, flags, and letters with a separate
accent mark.

```ts
deleteBackward(createTextBuffer("hi 👨‍👩‍👧"));
// → "hi ", the whole family emoji in one step

deleteBackward(createTextBuffer("🇨🇭"));
// → "", the whole flag
```

## Related

- [`deleteForward`](../delete-forward/) — the Delete key.
- [`insertText`](../insert-text/) — inserting `""` also deletes a selection.
- [`backspace`](../../input-state/backspace/) — Backspace in a masked field, where slots empty instead of shifting.
