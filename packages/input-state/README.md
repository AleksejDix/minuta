# input-state

The state of an input field: a [text buffer](../text-buffer), an
insert/overwrite mode and an optional mask, with pure keyboard operations.
Layer 2 of the input stack: no DOM.

```bash
npm install input-state text-buffer
```

```ts
import {
  backspace,
  createInputState,
  isComplete,
  paste,
  parseMask,
  typeChar,
} from "input-state";

let field = createInputState({ mask: parseMask("99.99.9999") });
field.buffer.text; // "__.__.____"

field = typeChar(field, "3"); // "3_.__.____", literals are skipped
field = paste(field, "1032026"); // "31.03.2026"
isComplete(field); // true
field = backspace(field); // "31.03.202_": the slot empties, nothing shifts
```

## Masks

`parseMask(pattern, placeholder = "_")` reads `9` as a digit slot, `A` as a
letter, `*` as a letter or digit and `\x` as the literal `x`; anything else is
a literal. A mask is plain data and survives JSON.

With a mask the text always has the full template length and the field is in
overwrite mode: typing fills the slot at the cursor, Backspace and Delete
empty a slot, and nothing ever shifts. That is what keeps a half-corrected
date intact.

- Digit slots accept decimal digits of every script (٣, ۳, ३, ３, …) and store
  them as `0`–`9`, so what is stored always parses.
- Characters a slot rejects are skipped when pasting.
- Letters outside the Basic Multilingual Plane (two UTF-16 units) do not fit
  one slot and are rejected.

Without a mask the field edits free text; `toggleMode` (the Insert key)
switches between insert and overwrite.

## Operations

| Function                                        | Does                                                 |
| ----------------------------------------------- | ---------------------------------------------------- |
| `createInputState({ mask, mode, value })`       | A field; masked fields start overwriting             |
| `typeChar(state, char)`                         | Type one character                                   |
| `paste(state, text)`                            | Paste; with a mask, fill slot by slot                |
| `backspace(state)`, `deleteForward(state)`      | Delete before or after the cursor                    |
| `setSelection(state, anchor, head?)`            | Move the cursor or select                            |
| `toggleMode(state)`                             | Insert ⇄ overwrite (free text only)                  |
| `isComplete(state)`                             | Whether every slot is filled                         |
| `emptyText(mask)`, `slotPositions(mask)`        | The empty template and the slot indices              |
| `accepts(class, char)`, `slotChar(class, char)` | Whether a slot takes a character, and what it stores |

Each operation returns a new state, or the same state when nothing changes.

## License

Apache-2.0
