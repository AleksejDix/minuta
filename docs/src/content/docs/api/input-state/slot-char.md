---
title: slotChar
description: The character a mask slot stores for a typed character, or nothing when the slot rejects it.
---

Find out what a slot stores when the user types a character. Digits of every
script become `0`–`9`; characters the slot does not take give nothing.

```ts
import { slotChar } from "input-state";
```

```ts
slotChar(kind, char);
```

## Example

```ts
import { slotChar } from "input-state";

slotChar("digit", "٣"); // → "3"   (Arabic-Indic)
slotChar("digit", "３"); // → "3"   (full-width)
slotChar("digit", "३"); // → "3"   (Devanagari)
slotChar("digit", "x"); // → undefined
slotChar("letter", "ä"); // → "ä"
```

## Parameters

| Name   | What it is                                                   |
| ------ | ------------------------------------------------------------ |
| `kind` | The kind of slot: `"digit"`, `"letter"` or `"alphanumeric"`. |
| `char` | The typed character.                                         |

## Returns

The character to put in the slot, or `undefined` when the slot rejects it.

## Why digits become ASCII

Users type digits in their own script, for example on an Arabic or Hindi
keyboard. The field stores them as `0`–`9` so that the value always parses
later. A digit is also turned into ASCII in an alphanumeric slot.

```ts
slotChar("alphanumeric", "۷"); // → "7"   (Persian seven)
```

To show the digits in the user's script again, format them when you display
them, for example with [`localeDigits`](../../datefield/locale-digits/) in
datefield.

## Letters that do not fit one slot

A slot holds one UTF-16 code unit. Some letters, such as the mathematical
script `𝒜`, need two. [`accepts`](../accepts/) says yes to them, but
`slotChar` rejects them.

```ts
accepts("letter", "𝒜"); // → true
slotChar("letter", "𝒜"); // → undefined
```

## Related

- [`accepts`](../accepts/) — only whether the kind of slot takes the character.
- [`typeChar`](../type-char/) and [`paste`](../paste/) — use `slotChar` for every character.
