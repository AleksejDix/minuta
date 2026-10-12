---
title: placeholder
description: The empty text of a date format, such as __.__.____ for de-CH.
---

Build the empty text of a format: an underscore for each digit, the separators
as they are, so `de-CH` gives `__.__.____`.

```ts
import { placeholder } from "datefield";
```

```ts
placeholder(format);
```

## Example

```ts
import { deriveFormat, placeholder } from "datefield";

placeholder(deriveFormat("de-CH")); // → "__.__.____"
placeholder(deriveFormat("en-US")); // → "__/__/____"
placeholder(deriveFormat("ko-KR")); // → "____. __. __."
placeholder(deriveFormat("de-CH", { hour: "2-digit", minute: "2-digit" })); // → "__:__"
```

## Parameters

| Name     | What it is                                           |
| -------- | ---------------------------------------------------- |
| `format` | The format from [`deriveFormat`](../derive-format/). |

## Returns

A string with `_` for every character of every part, and the literal
separators in between. It is the same text a new field starts with when you
create it with `dateMask(format)`.

Use it for a `placeholder` attribute, a label hint, or to tell whether the
field is still empty (`field.buffer.text === placeholder(format)`).

:::note
`placeholder` always uses `_`, even when you gave
[`dateMask`](../date-mask/) another placeholder character. Display-only parts
(weekday, era) get underscores too.
:::

## Related

- [`dateMask`](../date-mask/) — the mask a field starts from.
- [`formatLength`](../format-length/) — the length of this text.
