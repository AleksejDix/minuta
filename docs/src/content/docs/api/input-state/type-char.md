---
title: typeChar
description: Type one character into an input field, respecting its mask and mode.
---

Type one character at the cursor. In a masked field it fills the next slot; in
a free-text field it is inserted or overwrites, depending on the mode.

```ts
import { typeChar } from "input-state";
```

```ts
typeChar(state, char);
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

let field = createInputState({ mask: parseMask("99.99.9999") });

field = typeChar(field, "3"); // → "3_.__.____", cursor at 1
field = typeChar(field, "1"); // → "31.__.____", cursor at 3, past the "."
field = typeChar(field, "x"); // → unchanged: a digit slot rejects "x"
```

## Parameters

| Name    | What it is                                               |
| ------- | -------------------------------------------------------- |
| `state` | The field to type into.                                  |
| `char`  | The typed character, e.g. the `key` of a keyboard event. |

## Returns

A new state. When the character is rejected, you get the same state back, so
`next === state` tells you the key did nothing.

## In a masked field

- The character goes into the slot at the cursor, or the next slot after it.
  Literals such as `.` are skipped over.
- The cursor then moves to the next slot, or to the end after the last slot.
- A slot that already holds a character is overwritten. Nothing shifts.
- A character the slot does not accept is ignored and the state is returned
  unchanged. Typing a `.` does not jump to the next segment; that is what
  [`typeDate`](../../datefield/type-date/) in datefield adds.
- When every slot after the cursor is taken (the cursor is at the end), the
  key does nothing.
- If text is selected, the selected slots are emptied first and the character
  goes into the first of them, whichever way the selection was made.

```ts
const mask = parseMask("99.99.9999");
let full = createInputState({ mask, value: "31032026" });

typeChar(setSelection(full, 3), "1");
// → "31.13.2026", cursor at 4: the "0" was overwritten

typeChar(setSelection(full, 5, 0), "0");
// → "0_.__.2026": "31.03" was selected, so it was cleared first
```

Digit slots also accept digits from other scripts and store them as `0`–`9`.
See [`slotChar`](../slot-char/).

## In a free-text field

In **insert** mode the character is inserted at the cursor and replaces any
selection. In **overwrite** mode it replaces the character at the cursor;
at the end of the text, or over a selection, it is inserted as usual.

```ts
let text = createInputState({ value: "hello" });
text = setSelection(text, 0);
text = typeChar(text, "J"); // → "Jhello" (insert)

text = toggleMode(text);
text = typeChar(text, "X"); // → "JXello" (overwrite)
```

:::caution
In free-text overwrite mode one call replaces one UTF-16 code unit. Typing
over an emoji such as 😀, which takes two units, leaves half of it behind.
:::

## Related

- [`paste`](../paste/) — type a whole string.
- [`backspace`](../backspace/) and [`deleteForward`](../delete-forward/) — delete.
- [`toggleMode`](../toggle-mode/) — switch between insert and overwrite.
- [`typeDate`](../../datefield/type-date/) — typing into a date field, where separators finish a segment.
