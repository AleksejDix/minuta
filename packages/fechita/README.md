# fechita

**Read dates the way people write them, in every modern locale.**

ISO 8601, RFC 2822, month and weekday names in 104 languages, 12- and 24-hour
times, and numbers in any order. Locale data generated from Unicode CLDR,
ambiguity reported instead of guessed, zero dependencies.

```bash
npm install fechita
```

```ts
import { parseDate } from "fechita";

parseDate("2026-03-31"); // { valid: true, date: 31 March 2026, … }
parseDate("31. März 2026"); // valid
parseDate("Tue, 31 Mar 2026 10:00:00 +0200"); // valid: the exact instant
parseDate("2026年3月31日 晚上11:59"); // valid: 23:59
parseDate("3/31/2026"); // valid: 31 can only be the day

const result = parseDate("04/05/2026");
if (!result.valid) {
  result.errorCodes; // ["AMBIGUOUS_DAY_MONTH"]
  result.candidates; // [4 May 2026, 5 April 2026]
}
parseDate("04/05/2026", { locale: "de-CH" }); // valid: 4 May
parseDate("04/05/2026", { locale: "en-US" }); // valid: 5 April
```

## Features

- **Verified against the source.** Every date and date-time
  `Intl.DateTimeFormat` writes in all 104 locales (17 dates in four styles,
  every hour of the day in two time styles) parses back to the same moment,
  on every CI run.
- **Data from Unicode CLDR.** Month and weekday names, AM/PM words, flexible
  day periods with their hours (晚上 is 19–24, 凌晨 0–5), eras and the numeric
  date order of every locale and region are generated from CLDR 48. A test
  fails when the data is stale.
- **Never guesses.** Every reading of the text is generated and impossible
  ones are dropped (31 April, month 13). A date is returned only when exactly
  one remains, or when `order` or `locale` picks one.
- **Actionable results.** String error codes (`AMBIGUOUS_DAY_MONTH`,
  `INVALID_DAY`, `WEEKDAY_MISMATCH`, …) and the candidate dates.
- **Forgiving input.** Digits of every script (٣١, ३१, ３１), any case, accents
  or not ("Marz"), abbreviation dots, separators of any kind, surrounding text.
- **Words as languages write them.** With suffixes (Basque `martxoaren`),
  after a Hebrew prefix (`במרץ`), inside text without spaces (`火曜日`), across
  words (`Dydd Mawrth` is Tuesday, not March).
- **Pay for what you use.** 4 kB for the rules and one locale, 29 kB for all
  104 (minified and brotlied). ES modules, `sideEffects: false`.

## What it reads

| Form                     | Examples                                                       |
| ------------------------ | -------------------------------------------------------------- |
| ISO 8601 / RFC 3339      | `2026-03-31`, `20260331`, `2026-03-31T10:00:00.250+02:00`      |
| RFC 2822 (email headers) | `Tue, 31 Mar 2026 10:00:00 +0200`                              |
| Month names              | `31. März 2026`, `March 31, 2026`, `31 de marzo de 2026`       |
| Numbers in any order     | `31.03.2026`, `3/31/2026`, `2026/3/31`, `31032026`, `31.03.26` |
| Times                    | `14:05`, `2:05 PM`, `오후 2:05`, `晚上11:59`, `14.05` (Danish) |
| Offsets                  | `Z`, `+02:00`, `+0200`, `GMT+1`, `UTC`                         |
| Eras                     | `44 v. Chr.`, `500 BC`                                         |

Dates are Gregorian. Two-digit years fall in the 100 years from 80 years
before `referenceDate` (default: now). Years with an era are taken as written
and counted astronomically: 44 BC is year −43, 1 BC is year 0.

## Fewer locales

The default entry knows all 104 locales. For a smaller bundle, bind the rules
to the locales you need:

```ts
import { withLocales } from "fechita/core";
import { de } from "fechita/locales/de";
import { en } from "fechita/locales/en";

const { parseDate } = withLocales({ de, en });
parseDate("31. März 2026"); // valid
parseDate("31 марта 2026"); // NO_DATE: Russian is not loaded
```

## API

### `parseDate(text, options?)`

Returns `{ valid: true, date, parts }` or
`{ valid: false, errorCodes, candidates }`.

| Option          | Does                                                                                                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `locale`        | The text's locale: its order resolves ambiguous dates and its own words win when two languages use one word differently (`listopad` is November in Polish, October in Croatian) |
| `order`         | `"DMY"`, `"MDY"` or `"YMD"` for ambiguous numeric dates; wins over `locale`                                                                                                     |
| `referenceDate` | Reference for two-digit years, default now                                                                                                                                      |

`parts` holds `year`, `month` (1–12), `day`, `hour`, `minute`, `second`,
`millisecond` and, when the text has one, `offsetMinutes`. With an offset,
`date` is that exact instant; otherwise it is local time.

### Error codes

| Code                  | Meaning                                                            |
| --------------------- | ------------------------------------------------------------------ |
| `AMBIGUOUS_DAY_MONTH` | Day and month can be read both ways; pass `order` or `locale`      |
| `AMBIGUOUS_MONTH`     | A word names different months in the loaded locales; pass `locale` |
| `INVALID_DAY`         | The day does not exist in that month                               |
| `INVALID_MONTH`       | The month is not 1–12                                              |
| `INVALID_TIME`        | The time is out of range                                           |
| `NO_DATE`             | No day, month and year in the text                                 |
| `WEEKDAY_MISMATCH`    | The weekday in the text is not the weekday of the date             |

### `withLocales(locales)` (`fechita/core`)

Returns `{ parseDate, locales }` bound to the given locale data.
`parseDateWith(locales, text, options)` is the unbound function.

## Locale data

`npm run data -w fechita` regenerates `src/locales` from the installed
`cldr-dates-full` and `cldr-core` (CLDR 48, the version `Intl` in Node 24
uses).

## License

Apache-2.0
