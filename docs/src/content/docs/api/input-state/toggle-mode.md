---
title: toggleMode
description: Switch a free-text field between insert and overwrite mode, like the Insert key.
---

Switch a free-text field between insert mode and overwrite mode, like the
Insert key in an editor.

```ts
import { toggleMode } from "input-state";
```

```ts
toggleMode(state);
```

## Example

```ts
import {
  createInputState,
  parseMask,
  setSelection,
  toggleMode,
  typeChar,
} from "input-state";

let field = setSelection(createInputState({ value: "hello" }), 0);
field.mode; // → "insert"

field = toggleMode(field);
field.mode; // → "overwrite"
typeChar(field, "J").buffer.text; // → "Jello"
```

## Parameters

| Name    | What it is           |
| ------- | -------------------- |
| `state` | The field to change. |

## Returns

A new state with the other mode. The text and selection do not change.

## Insert and overwrite

- **Insert**: a typed character is added at the cursor and the text after it
  moves right. This is how most fields work.
- **Overwrite**: a typed character replaces the character at the cursor. At
  the end of the text it is added as usual.

The mode belongs to the field, not to the text, just like the Insert key
belongs to the editor and not to the document.

## Masked fields always overwrite

A masked field has a fixed length, so it can only overwrite. `toggleMode`
returns the same state unchanged.

```ts
const date = createInputState({ mask: parseMask("99.99.9999") });
toggleMode(date) === date; // → true
```

## Related

- [`typeChar`](../type-char/) — how each mode types.
- [`createInputState`](../create-input-state/) — the `mode` option sets the starting mode.
