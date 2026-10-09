# text-buffer

Immutable text plus a selection, with pure editing operations. Layer 1 of the
input stack: no input modes, no masks, no DOM.

```bash
npm install text-buffer
```

```ts
import {
  createTextBuffer,
  deleteBackward,
  insertText,
  moveCursor,
  select,
} from "text-buffer";

let buffer = createTextBuffer("hello"); // cursor at the end
buffer = insertText(buffer, " world"); // "hello world"
buffer = select(buffer, 0, 5); // "hello" selected
buffer = insertText(buffer, "goodbye"); // "goodbye world", cursor after "goodbye"
buffer = moveCursor(buffer, 1); // cursor after the space
buffer = deleteBackward(buffer); // "goodbyeworld"
```

## The model

- `TextBuffer` is `{ text, selection: { anchor, head } }`, deeply readonly. A
  cursor is a collapsed selection (`anchor === head`); `head` is where the
  caret is, so a backward selection has `head < anchor`.
- Positions are UTF-16 indices, the unit the DOM uses for `selectionStart`
  and `selectionEnd`.
- Every operation returns a new buffer, or the same buffer when nothing
  changes, so `next === buffer` tells you nothing happened.

## Operations

| Function                         | Does                                                           |
| -------------------------------- | -------------------------------------------------------------- |
| `createTextBuffer(text?, sel?)`  | A buffer; the cursor defaults to the end                       |
| `select(buffer, anchor, head?)`  | Set the selection (clamped); omit `head` for a cursor          |
| `moveCursor(buffer, offset)`     | Arrow keys: move, or collapse a selection to the side moved to |
| `insertText(buffer, text)`       | Type or paste at the cursor, replacing the selection           |
| `replaceRange(buffer, range, t)` | Replace `{ from, to }` and put the cursor after the new text   |
| `deleteBackward(buffer)`         | Backspace: the selection, or the character before the cursor   |
| `deleteForward(buffer)`          | Delete: the selection, or the character after the cursor       |
| `selectionStart`, `selectionEnd` | The lower and upper edge of the selection                      |
| `isCollapsed(buffer)`            | Whether the selection is a cursor                              |

Backspace and Delete remove a whole character as users see it (a grapheme
cluster): emoji sequences such as 👨‍👩‍👧, flags and letters with combining
accents go in one keystroke.

## The input stack

1. **text-buffer** – text and selection
2. [input-state](../input-state) – insert/overwrite modes and masks
3. [datefield](../datefield) – date segments on top of a mask
4. [input-dom](../input-dom) – binds a state to an `<input>` element

## License

Apache-2.0
