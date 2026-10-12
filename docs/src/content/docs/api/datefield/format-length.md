---
title: formatLength
description: How many characters a date written in a format takes, separators included.
---

Count how many characters a date in a format takes, separators included:
`de-CH` dates are 10 characters long (`31.03.2026`).

```ts
import { formatLength } from "datefield";
```

```ts
formatLength(format);
```

## Example

```ts
import { deriveFormat, formatLength } from "datefield";

formatLength(deriveFormat("de-CH")); // → 10   "31.03.2026"
formatLength(deriveFormat("ko-KR")); // → 13   "2026. 03. 31."
formatLength(deriveFormat("ar-EG")); // → 12   two invisible right-to-left marks
```

## Parameters

| Name     | What it is                                           |
| -------- | ---------------------------------------------------- |
| `format` | The format from [`deriveFormat`](../derive-format/). |

## Returns

The total number of characters: the length of every segment plus every
separator. Positions are counted in UTF-16 units, the same unit the browser
uses for `selectionStart` and `selectionEnd`.

Use it for a `maxlength` or `size` attribute, or to size the field with CSS
(`width: <n>ch`).

## Related

- [`placeholder`](../placeholder/) — the empty text, which has exactly this length.
- [`deriveFormat`](../derive-format/) — where the format comes from.
