---
title: parseMask
description: Turn a pattern such as 99.99.9999 into a mask of slots and literals.
---

Turn a pattern such as `99.99.9999` into a mask: a fixed list of slots, which
the user fills, and literals, which are always there.

```ts
import { parseMask } from "input-state";
```

```ts
parseMask(pattern, placeholder?)
```

## Example

```ts
import { createInputState, emptyText, parseMask } from "input-state";

const mask = parseMask("99.99.9999");

emptyText(mask); // → "__.__.____"
createInputState({ mask }).buffer.text; // → "__.__.____"
```

## Parameters

| Name          | What it is                                                                |
| ------------- | ------------------------------------------------------------------------- |
| `pattern`     | The template. Each character is a slot or a literal, see the table below. |
| `placeholder` | Optional. The character shown in an empty slot. Defaults to `_`.          |

## The pattern

| In the pattern | Becomes                                                      |
| -------------- | ------------------------------------------------------------ |
| `9`            | A slot for one digit.                                        |
| `A`            | A slot for one letter.                                       |
| `*`            | A slot for one letter or digit.                              |
| `\x`           | The literal character `x`, even when `x` is `9`, `A` or `*`. |
| anything else  | A literal: shown as is, never typed over.                    |

```ts
emptyText(parseMask("AAA-999")); // → "___-___"
emptyText(parseMask("+41 99 999 99 99")); // → "+41 __ ___ __ __"
emptyText(parseMask("\\9 9", "#")); // → "9 #", the first 9 is a literal
emptyText(parseMask("99/99", "·")); // → "··/··"
```

In a JavaScript string the backslash itself must be escaped, so `\9` is
written `"\\9"`.

## Returns

A mask: `{ placeholder, tokens }`, where each token is either
`{ kind: "slot", accepts }` (with `accepts` being `"digit"`, `"letter"` or
`"alphanumeric"`) or `{ kind: "literal", char }`. There is one token per
character of the field's text.

A mask is plain data. It survives `JSON.stringify` and `JSON.parse`, so you
can store it or send it over the network and still use it.

:::caution
Pick a placeholder that no slot accepts. [`isComplete`](../is-complete/)
counts a slot holding the placeholder character as empty, so a placeholder
of `0` in a digit mask makes a typed `0` look empty.
:::

## Related

- [`createInputState`](../create-input-state/) — create a field with the mask.
- [`emptyText`](../empty-text/) and [`slotPositions`](../slot-positions/) — inspect a mask.
- [`dateMask`](../../datefield/date-mask/) — a mask made from a date format.
