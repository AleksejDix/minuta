---
title: isCollapsed
description: Whether a buffer's selection is just a cursor, with nothing selected.
---

Check whether nothing is selected, so the selection is just a cursor.

```ts
import { isCollapsed } from "text-buffer";
```

```ts
isCollapsed(buffer);
```

## Example

```ts
import { createTextBuffer, isCollapsed } from "text-buffer";

isCollapsed(createTextBuffer("hi")); // → true, a cursor at the end
isCollapsed(createTextBuffer("hi", { anchor: 0, head: 2 })); // → false, "hi" is selected
```

## Parameters

| Name     | What it is             |
| -------- | ---------------------- |
| `buffer` | The buffer to look at. |

## Returns

`true` when `anchor` and `head` are the same position, `false` when some text
is selected.

## Related

- [`select`](../select/) — leave out `head` to create a collapsed selection.
- [`selectionStart`](../selection-start/) and [`selectionEnd`](../selection-end/) — the edges of a selection.
