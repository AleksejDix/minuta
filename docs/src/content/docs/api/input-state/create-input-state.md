---
title: createInputState
description: Create the state of an input field — free text or masked — with an optional start value.
---

Create the state of an input field. Give it a mask for a field like
`__.__.____`, or leave the mask out for free text.

```ts
import { createInputState } from "input-state";
```

```ts
createInputState(options?)
```

## Example

```ts
import { createInputState, parseMask } from "input-state";

const date = createInputState({ mask: parseMask("99.99.9999") });
date.buffer.text; // → "__.__.____"
date.mode; // → "overwrite"

const name = createInputState({ value: "hello" });
name.buffer.text; // → "hello", cursor at the end
name.mode; // → "insert"
```

## Parameters

| Name      | What it is                                                           |
| --------- | -------------------------------------------------------------------- |
| `options` | Optional. `mask`, `mode` and `value`, see [Options](#options) below. |

## Options

| Option  | Default    | What it does                                                                                  |
| ------- | ---------- | --------------------------------------------------------------------------------------------- |
| `mask`  | none       | A mask from [`parseMask`](../parse-mask/). Without it the field holds free text.              |
| `mode`  | `"insert"` | `"insert"` or `"overwrite"`. Only used for free text: a masked field is always `"overwrite"`. |
| `value` | `""`       | The starting text. In a masked field it is filled into the slots, see below.                  |

## Returns

A state: `{ buffer, mask, mode }`.

- `buffer` is a [text buffer](../../text-buffer/overview/): `buffer.text` is
  what the field shows and `buffer.selection` is the cursor or selection.
- `mask` is the mask, or `undefined` for free text.
- `mode` is `"insert"` or `"overwrite"`.

## Where the cursor starts

In a free-text field the cursor starts at the end of `value`. In a masked
field it starts on the first empty slot, or at the end when every slot is
filled.

```ts
const mask = parseMask("99.99.9999");

createInputState({ mask, value: "31.__.2026" });
// → "31.__.2026", cursor at 3 (the first empty slot)

createInputState({ mask, value: "31032026" });
// → "31.03.2026", cursor at 10 (the end)
```

## How a masked `value` is filled in

When `value` already looks like the template (same length, literals in the
right places), it is taken character by character. A character that does not
fit its slot leaves that slot empty.

```ts
createInputState({ mask, value: "31.03.2026" }); // → "31.03.2026"
createInputState({ mask, value: "31.0x.2026" }); // → "31.0_.2026"
```

Any other value is filled in slot by slot, like a [`paste`](../paste/):
characters a slot does not take are skipped.

```ts
createInputState({ mask, value: "31032026" }); // → "31.03.2026"
createInputState({ mask, value: "31.03" }); // → "31.03.____"
```

The value is not read as a date. `"3.3.2026"` gives `"33.20.26__"`, because
the digits simply go into the next free slot. To fill a date field from any
date text, use [`typeDate`](../../datefield/type-date/) with a date parser.

## Related

- [`parseMask`](../parse-mask/) — build the mask.
- [`typeChar`](../type-char/), [`paste`](../paste/), [`backspace`](../backspace/) — edit the field.
- [`createTextBuffer`](../../text-buffer/create-text-buffer/) — the buffer underneath.
