---
title: insertText
description: Type or paste text at the cursor, replacing the selected text.
---

Put text at the cursor. If text is selected, the new text replaces it.

```ts
import { insertText } from "text-buffer";
```

```ts
insertText(buffer, text);
```

## Example

```ts
import { createTextBuffer, insertText } from "text-buffer";

insertText(createTextBuffer("hello"), " world");
// → "hello world", cursor at 11

const selected = createTextBuffer("hello world", { anchor: 0, head: 5 });
insertText(selected, "goodbye");
// → "goodbye world", cursor at 7 (right after "goodbye")
```

## Parameters

| Name     | What it is                                                        |
| -------- | ----------------------------------------------------------------- |
| `buffer` | The buffer to type into.                                          |
| `text`   | The text to insert: one typed character or a whole pasted string. |

## Returns

A new buffer. The cursor is collapsed right after the inserted text.

## Inserting nothing

Inserting `""` with only a cursor changes nothing, so you get the same buffer
back. Inserting `""` over a selection deletes the selection.

```ts
const buffer = createTextBuffer("hello");
insertText(buffer, "") === buffer; // → true

insertText(createTextBuffer("hello", { anchor: 0, head: 2 }), "");
// → "llo", cursor at 0
```

## The direction of the selection does not matter

A backward selection is replaced the same way as a forward one.

```ts
insertText(createTextBuffer("hello world", { anchor: 5, head: 0 }), "bye");
// → "bye world", cursor at 3
```

## Related

- [`replaceRange`](../replace-range/) — replace any range, not only the selection.
- [`deleteBackward`](../delete-backward/) — Backspace.
- [`typeChar`](../../input-state/type-char/) and [`paste`](../../input-state/paste/) — typing with masks and overwrite mode.
