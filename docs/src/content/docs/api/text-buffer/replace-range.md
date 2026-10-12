---
title: replaceRange
description: Replace a range of the text with new text and put the cursor after it.
---

Replace the text between two positions with new text. The cursor ends up right
after the new text.

```ts
import { replaceRange } from "text-buffer";
```

```ts
replaceRange(buffer, range, text);
```

## Example

```ts
import { createTextBuffer, replaceRange } from "text-buffer";

const buffer = createTextBuffer("hello world");

replaceRange(buffer, { from: 0, to: 5 }, "goodbye");
// → "goodbye world", cursor at 7
```

## Parameters

| Name     | What it is                                                                                                   |
| -------- | ------------------------------------------------------------------------------------------------------------ |
| `buffer` | The buffer to change.                                                                                        |
| `range`  | `{ from, to }`: the positions to replace between. `from` may be larger than `to`; the order does not matter. |
| `text`   | The new text. Pass `""` to delete the range.                                                                 |

## Returns

A new buffer with the range replaced. The cursor is collapsed right after the
new text, wherever it was before. A new buffer is returned even when the text
stays the same.

## Inserting without removing anything

When `from` and `to` are the same, nothing is removed and the text is inserted
at that position.

```ts
replaceRange(
  createTextBuffer("hello", { anchor: 1, head: 1 }),
  { from: 5, to: 5 },
  "!"
);
// → "hello!", cursor at 6 (moved from 1 to after the "!")
```

## Positions are clamped

A range that reaches past the end stops at the end.

```ts
replaceRange(createTextBuffer("hello"), { from: 3, to: 99 }, "!");
// → "hel!", cursor at 4
```

## Related

- [`insertText`](../insert-text/) — replace the current selection.
- [`deleteBackward`](../delete-backward/) and [`deleteForward`](../delete-forward/) — delete one character.
