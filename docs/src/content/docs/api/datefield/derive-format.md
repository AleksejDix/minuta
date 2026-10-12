---
title: deriveFormat
description: Ask the browser how a locale writes a date, and get it back as a list of parts you can build a date field from.
---

Ask the browser how a locale writes a date, so `de-CH` gives you
day–dot–month–dot–year and `en-US` gives you month–slash–day–slash–year. You
never write a format string yourself.

```ts
import { deriveFormat } from "datefield";
```

```ts
deriveFormat(locale, options?)
```

## Example

```ts
import { deriveFormat, placeholder } from "datefield";

placeholder(deriveFormat("de-CH")); // → "__.__.____"
placeholder(deriveFormat("en-US")); // → "__/__/____"
placeholder(deriveFormat("ja-JP")); // → "____/__/__"
placeholder(deriveFormat("ko-KR")); // → "____. __. __."
```

The result itself is a plain list of parts, in the order the locale writes
them:

```ts
deriveFormat("de-CH");
// → [
//     { type: "day", length: 2 },
//     { type: "literal", char: "." },
//     { type: "month", length: 2 },
//     { type: "literal", char: "." },
//     { type: "year", length: 4 },
//   ]
```

## Parameters

| Name      | What it is                                                                                                  |
| --------- | ----------------------------------------------------------------------------------------------------------- |
| `locale`  | A language tag such as `"de-CH"`, `"en-US"` or `navigator.language`.                                        |
| `options` | Optional. The same options as `Intl.DateTimeFormat`, to choose which parts appear. See [Options](#options). |

## What a format is

A format is the recipe for one kind of date text. Each entry is either:

- a **segment** — a part you type digits into: `day`, `month`, `year`,
  `hour`, `minute` or `second`, with how many characters it takes;
- a **literal** — the fixed separator between them, such as `.`, `/`, `-`
  or `. `.

Every other function in datefield takes this format, so derive it once per
field and keep it.

## Options

Without options you get a date only: two-digit day, two-digit month, four-digit
year. Pass `Intl.DateTimeFormat` options to choose other parts.

| Option you pass                                                                             | Result (`de-CH`)    |
| ------------------------------------------------------------------------------------------- | ------------------- |
| _(none)_                                                                                    | `__.__.____`        |
| `{ day: "2-digit", month: "2-digit", year: "2-digit" }`                                     | `__.__.__`          |
| `{ hour: "2-digit", minute: "2-digit" }`                                                    | `__:__`             |
| `{ day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }` | `__.__.____, __:__` |

A segment's length comes from how the locale writes 13 November 2026, 14:35:47.
That date has two digits in every part, so `day: "numeric"` still gives a
two-character day.

## Returns

The format: a list of segments and literals, in the locale's order.

## Locales

The order and separators come from the browser's own locale data, so there is
nothing to ship and every locale works:

| Locale  | Format          | Order |
| ------- | --------------- | ----- |
| `de-CH` | `__.__.____`    | DMY   |
| `en-US` | `__/__/____`    | MDY   |
| `en-GB` | `__/__/____`    | DMY   |
| `nl-NL` | `__-__-____`    | DMY   |
| `ja-JP` | `____/__/__`    | YMD   |
| `ko-KR` | `____. __. __.` | YMD   |

The field always uses the Gregorian calendar and Latin digits inside, even
when the locale normally does not. `fa-IR` and `th-TH` keep their order and
separators but get Gregorian years (2026, not a Persian or Buddhist year). To _show_ a
locale's own digits, see [`localeDigits`](../locale-digits/).

Some locales put invisible characters in their separators. `ar-EG` gives
`__‏/__‏/____`: each `/` has a right-to-left mark in front of it, so the text is
12 characters long, not 10.

## Display-only parts

You can ask for a weekday, era, AM/PM, fractional seconds or time zone name.
They come back as parts too, but nobody can type them. They work with
[`fromDate`](../from-date/) for display, and [`dateMask`](../date-mask/)
refuses them.

```ts
deriveFormat("en-US", { hour: "2-digit", minute: "2-digit" });
// → hour, ":", minute, " ", dayPeriod   (the AM/PM part)

deriveFormat("en-US", { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
// → hour, ":", minute   (no AM/PM, so it can be typed)
```

:::caution
Do not ask for a month by name (`month: "long"` or `"short"`). The month
becomes a run of digit slots as long as the month name, which nobody can fill
in a meaningful way.
:::

## Related

- [`dateMask`](../date-mask/) — turn the format into an input mask.
- [`placeholder`](../placeholder/) — the empty text, e.g. `__.__.____`.
- [`dateOrder`](../date-order/) — `"DMY"`, `"MDY"` or `"YMD"`.
- [`parseSegments`](../parse-segments/) — cut field text into segments.
