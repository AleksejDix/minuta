---
title: accepts
description: Whether a kind of mask slot — digit, letter or alphanumeric — takes a character.
---

Check whether a kind of slot takes a character: a digit slot takes digits, a
letter slot takes letters, an alphanumeric slot takes both.

```ts
import { accepts } from "input-state";
```

```ts
accepts(kind, char);
```

## Example

```ts
import { accepts } from "input-state";

accepts("digit", "3"); // → true
accepts("digit", "a"); // → false
accepts("letter", "ä"); // → true
accepts("alphanumeric", "-"); // → false
```

## Parameters

| Name   | What it is                                                                                      |
| ------ | ----------------------------------------------------------------------------------------------- |
| `kind` | The kind of slot: `"digit"` (a `9` in the pattern), `"letter"` (`A`) or `"alphanumeric"` (`*`). |
| `char` | The character to test.                                                                          |

## Returns

`true` when `char` is exactly one character of that kind, `false` otherwise.
A string of two characters is never accepted.

## Every script counts

"Digit" means a decimal digit of any script, and "letter" means a letter of
any alphabet.

```ts
accepts("digit", "٣"); // → true, Arabic-Indic three
accepts("letter", "ж"); // → true
accepts("digit", "12"); // → false, two characters
```

`accepts` only answers the question. A slot may still refuse a character it
accepts, or store a different one. Use [`slotChar`](../slot-char/) to know
what ends up in the field.

## Related

- [`slotChar`](../slot-char/) — the character a slot actually stores.
- [`parseMask`](../parse-mask/) — the pattern letters for each kind.
