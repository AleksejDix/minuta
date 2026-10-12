---
title: createTextBuffer
description: Create a text buffer from some text and an optional selection.
---

Create a buffer that holds some text and a cursor or selection.

```ts
import { createTextBuffer } from "text-buffer";
```

```ts
createTextBuffer(text?, selection?)
```

## Example

```ts
import { createTextBuffer } from "text-buffer";

createTextBuffer("hello");
// → { text: "hello", selection: { anchor: 5, head: 5 } }  (cursor at the end)

createTextBuffer("hello", { anchor: 0, head: 5 });
// → "hello" with everything selected

createTextBuffer();
// → { text: "", selection: { anchor: 0, head: 0 } }
```

## Parameters

| Name        | What it is                                                                                                                         |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `text`      | Optional. The starting text. Defaults to the empty string.                                                                         |
| `selection` | Optional. `{ anchor, head }`: where the selection starts and where the caret is. Leave it out for a cursor at the end of the text. |

## Returns

A new buffer: `{ text, selection: { anchor, head } }`.

## Positions outside the text are clamped

A position below 0 becomes 0. A position past the end becomes the end of the
text. You never get a selection that points outside the text.

```ts
createTextBuffer("hello", { anchor: 1, head: 99 });
// → selection { anchor: 1, head: 5 }

createTextBuffer("hello", { anchor: -3, head: 2 });
// → selection { anchor: 0, head: 2 }
```

## Backward selections are kept

When `head` is smaller than `anchor`, the buffer keeps it that way. That is a
backward selection: the user selected from right to left. See
[`selectionStart`](../selection-start/) to get the left edge either way.

## Related

- [`select`](../select/) — change the selection of an existing buffer.
- [`insertText`](../insert-text/) — type into the buffer.
- [`createInputState`](../../input-state/create-input-state/) — a buffer with a mask and a mode.
