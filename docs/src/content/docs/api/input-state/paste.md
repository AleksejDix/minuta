---
title: paste
description: Paste text into an input field; in a masked field the characters fill the slots one by one.
---

Paste a string at the cursor. In a masked field the characters are typed into
the slots one after another, and characters a slot does not accept are
skipped.

```ts
import { paste } from "input-state";
```

```ts
paste(state, text);
```

## Example

```ts
import { createInputState, parseMask, paste, setSelection } from "input-state";

const mask = parseMask("99.99.9999");
const empty = createInputState({ mask });

paste(empty, "31032026"); // → "31.03.2026"
paste(empty, "31.03.2026"); // → "31.03.2026", the dots are skipped
```

## Parameters

| Name    | What it is               |
| ------- | ------------------------ |
| `state` | The field to paste into. |
| `text`  | The pasted text.         |

## Returns

A new state with the cursor after the last character that was placed.

## In a masked field

A paste works exactly like calling [`typeChar`](../type-char/) once for each
character. So:

- It starts at the cursor, not at the start of the field.
- Each character goes into the next free slot; literals are jumped over.
- A character the next slot rejects is skipped, and the next character is
  tried in the same slot.
- Characters left over when the slots run out are dropped.

```ts
paste(empty, "3103202612345"); // → "31.03.2026", the rest is dropped

const code = createInputState({ mask: parseMask("AAA-999") });
paste(code, "1a2b3c4");
// → "abc-4__": "1", "2", "3" are skipped in letter slots
```

Because characters are only skipped, never understood, a paste does not know
what the text means. Spaces and slashes are skipped, but the digits after them
just go into the next slot:

```ts
paste(empty, "31 / 3 / 2026"); // → "31.32.026_"

const time = createInputState({ mask: parseMask("99:99") });
paste(time, "9:30"); // → "93:0_"
```

For dates, [`typeDate`](../../datefield/type-date/) handles separators and can
read a pasted date in any form with [fechita](../../fechita/parse-date/).

Digits from other scripts are stored as ASCII digits:

```ts
paste(empty, "٣١٠٣٢٠٢٦"); // → "31.03.2026"
```

## In a free-text field

The text is inserted at the cursor and replaces any selection, in both insert
and overwrite mode.

```ts
let text = createInputState({ value: "hello" });
paste(setSelection(text, 0, 5), "bye"); // → "bye"
```

## Related

- [`typeChar`](../type-char/) — what a paste does for each character.
- [`slotChar`](../slot-char/) — which characters a slot accepts.
- [`typeDate`](../../datefield/type-date/) — pasting into a date field.
- [`parseDate`](../../fechita/parse-date/) — read a date from pasted text.
