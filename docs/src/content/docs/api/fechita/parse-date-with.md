---
title: parseDateWith
description: Read the date in a text with the locales you pass in, in one call.
---

Read the date in a text using only the locales you pass in. It is the
function behind both `parseDate` and `withLocales`.

```ts
import { parseDateWith } from "fechita/core";
```

```ts
parseDateWith(locales, text, options?)
```

## Example

```ts
import { parseDateWith } from "fechita/core";
import { de } from "fechita/locales/de";
import { en } from "fechita/locales/en";

const locales = { de, en };

parseDateWith(locales, "31. März 2026"); // → valid: 31 March 2026
parseDateWith(locales, "04/05/2026"); // → invalid: AMBIGUOUS_DAY_MONTH
parseDateWith(locales, "04/05/2026", { order: "MDY" }); // → valid: 5 April 2026
```

## Parameters

| Name      | What it is                                                                                              |
| --------- | ------------------------------------------------------------------------------------------------------- |
| `locales` | An object of locale data, keyed by locale tag: `{ de, en }`. See [Locales](../locales/).                |
| `text`    | The text to read.                                                                                       |
| `options` | Optional. `locale`, `order` and `referenceDate`, the same as for [`parseDate`](../parse-date/#options). |

## Returns

The same result as [`parseDate`](../parse-date/#returns): `{ valid: true,
date, parts }` or `{ valid: false, errorCodes, candidates }`.

## `parseDateWith` or `withLocales`?

They do the same thing. Use [`withLocales`](../with-locales/) when you parse
in many places: you bind the locales once and get a `parseDate` with the
familiar shape. Use `parseDateWith` when the locales change from call to
call, or when you want everything in one line.

Keep the same `locales` object between calls. fechita builds its word index
once per object, so a new `{ de, en }` on every call builds it again.

## Related

- [`withLocales`](../with-locales/) — bind the locales once.
- [`parseDate`](../parse-date/) — all behaviour, options and error codes.
- [Locales](../locales/) — what to pass as `locales`.
