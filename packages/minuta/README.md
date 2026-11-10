# minuta

Divide time into pieces. Pure functions over plain, readonly data, computed
with [Temporal](https://tc39.es/proposal-temporal/docs/) and named like it.

```bash
npm install @aleksejdix/minuta
```

| What you import                                    | minified + brotli |
| -------------------------------------------------- | ----------------- |
| `period`, `next`, `divide`                         | 2.8 kB            |
| `monthGrid`                                        | 2.6 kB            |
| `withUnits` + `createUnits`: every function        | 5.4 kB            |
| `temporalReady` from `@aleksejdix/minuta/temporal` | 0.3 kB            |

Zero dependencies, ES modules only, `sideEffects: false`. Budgets are
checked on every CI run. Where the runtime has no Temporal yet (Safari,
Node 24), install `temporal-polyfill` and `await temporalReady()` from
`@aleksejdix/minuta/temporal` once, before anything computes; elsewhere
nothing more is loaded.

## The model

Every time range is a **Period**: `{ start, end, unit }`, `start` included
and `end` excluded. A year, quarter, month, week or day is made of calendar
dates (`Temporal.PlainDate`), so no clock change can move it; an hour,
minute or second is made of moments in a time zone
(`Temporal.ZonedDateTime`). `divide` splits any period into smaller ones.
That is the whole model.

```ts
import { divide, year } from "@aleksejdix/minuta";

const months = divide(year(Temporal.PlainDate.from("2026-01-01")), "month"); // 12 periods
const march = months[2]; // { start: 2026-03-01, end: 2026-04-01, unit: "month" }
const days = march === undefined ? [] : divide(march, "day"); // 31 periods
```

Everything comes from one entry, ready to use: weeks start on Monday
(ISO 8601), moments lie in the runtime's zone, dates keep their own
calendar.

## Functions

| Family    | Functions                                                                                                                                                   |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Create    | `period(start, end)` · `year(value)` · `quarter(value)` · `month(value)` · `week(value)` · `day(value)` · `hour(value)` · `minute(value)` · `second(value)` |
| Navigate  | `next(period)` · `previous(period)` · `shift(period, steps)`                                                                                                |
| Compose   | `divide(period, unit, { step })` · `merge(periods, unit?)`                                                                                                  |
| Edit      | `clamp(period, bounds)` · `gap(a, b)`                                                                                                                       |
| Compare   | `contains(period, value)` · `overlaps(a, b)` · `same(a, b, unit)` · `equals(a, b)` · `compare(a, b)`                                                        |
| Measure   | `count(period, unit)` · `round(value, { smallestUnit, roundingIncrement, roundingMode })`                                                                   |
| Calendars | `monthGrid(value)` · `yearGrid(value)` · `dayGrid(value)` · `isWeekday(period)` · `isWeekend(period)`                                                       |
| Text      | `toLocaleString(period, locales?, options?)`                                                                                                                |

Where Temporal has a word, minuta uses it: `round` takes Temporal's options
and rounding modes, `equals` and `compare` work like Temporal's,
`toLocaleString` formats. `count` returns a number of units, where
`start.until(end)` gives a `Temporal.Duration`.

```ts
import {
  year,
  compare,
  contains,
  count,
  day,
  month,
  next,
  previous,
  period,
  round,
  shift,
} from "@aleksejdix/minuta";

const march = month(Temporal.PlainDate.from("2026-03-15"));
next(march); // April
previous(march); // February
shift(march, 3); // June
contains(march, Temporal.PlainDate.from("2026-03-20")); // true
contains(march, Temporal.PlainDate.from("2026-04-01")); // false: the end is excluded

period(
  Temporal.PlainDate.from("2026-01-01"),
  Temporal.PlainDate.from("2026-04-01")
); // January to March

count(march, "day"); // 31
count(day(Temporal.PlainDate.from("2026-03-29")), "hour"); // 23 in Europe/Zurich (DST)
[next(march), march].sort(compare); // March, April

round(Temporal.Now.zonedDateTimeISO(), {
  roundingIncrement: 15,
  smallestUnit: "minute",
}); // the nearest quarter hour
round(Temporal.PlainDate.from("2026-03-18"), {
  roundingMode: "floor",
  smallestUnit: "week",
}); // Monday 2026-03-16
```

`merge([])`, `clamp` without overlap, `split` outside the period and `gap`
between touching periods return `undefined`; no result is ever `null`.
Errors are a `RangeError` whose message starts with a `MinutaError` code
such as `UNIT_NOT_SUPPORTED` and says how to fix it.

## Your week, zone, calendar or locale

Rules and data are separate. Units are plain data made by `createUnits`;
`withUnits` binds every function to them, with the same names:

```ts
import { year, createUnits, day, month, withUnits } from "@aleksejdix/minuta";

const time = withUnits(
  createUnits({ locale: "ar-EG", timeZone: "Africa/Cairo" })
);
const today = Temporal.Now.plainDateISO();

time.week(today); // starts on Saturday
time.isWeekend(time.day(Temporal.PlainDate.from("2026-03-20"))); // true: a Friday
time.monthGrid(today).periods; // always 42 days: no layout jumps
time.yearGrid(today).periods; // whole weeks covering the year
time.dayGrid(today).periods; // the day's real hours in Cairo: 23, 24 or 25
time.units; // the units passed in
```

`locale` takes the week start and weekend from `Intl.Locale#getWeekInfo`;
`weekStartsOn` and `weekend` set them by hand (`"monday"`, or 0 for Sunday
to 6 for Saturday) and win over the locale. `timeZone` is where dates
become moments, as when a day is divided into hours. Hours, minutes and
seconds made from a `ZonedDateTime` keep its zone.

Months and years follow each date's calendar, or the one you set:
`createUnits({ calendar: "islamic-umalqura" })` gives lunar months of 29 or
30 days, `"hebrew"` years of 12 or 13 months, still in four quarters. Every
calendar Temporal has works, and `toLocaleString` writes it.

The bound functions have exactly the types of the main entry, so the two
cannot drift apart. Your own helpers take the bound object:

```ts
import type { DatePeriod, Minuta } from "@aleksejdix/minuta";
import {
  year,
  createUnits,
  day,
  month,
  period,
  withUnits,
} from "@aleksejdix/minuta";

const workdaysIn = (time: Minuta, month: DatePeriod) =>
  time.divide(month, "day").filter((day) => time.isWeekday(day));

const march = month(Temporal.PlainDate.from("2026-03-01"));
workdaysIn(withUnits(createUnits({ locale: "de-CH" })), march); // 22 day periods
```

Units are a partial map: `withUnits({ day, month })` with two specs from
`createUnits()` works for those units, and a missing one throws a
`RangeError` starting with `UNIT_NOT_SUPPORTED`. Custom units are data too:
add the name and its kind to `UnitRegistry` through module augmentation
(`fortnight: "date"`) and pass its spec (`kind`, `startOf`, `add`, `diff`)
in your units.

## Text

```ts
import { year, day, month, toLocaleString, period } from "@aleksejdix/minuta";

toLocaleString(month(Temporal.PlainDate.from("2026-03-15")), "de-CH"); // "März 2026"
toLocaleString(
  period(
    Temporal.PlainDate.from("2026-03-30"),
    Temporal.PlainDate.from("2026-04-06")
  ),
  "de-CH"
); // "30. März – 5. Apr. 2026"
toLocaleString(day(Temporal.PlainDate.from("2026-03-15")), "en-US", {
  weekday: "short",
}); // "Sun"
```

Each unit has its format: the month and year for a month, a range for weeks
and custom periods, with the shared parts collapsed. A date period shows
its first and last day; a time period its start and end, in its own zone.
The text is the same with native Temporal and the polyfill, on a server and
in the browser. Options that pick fields (`month`, `weekday`, `dateStyle`
…) replace the unit's defaults; others are added to them.

## For coding agents

The package ships [`llms.txt`](llms.txt): every export with its signature,
description and example, the naming rules and all error codes on one page.
It is generated from the source and checked in CI (`npm run docs:llms`
regenerates it). Error messages start with a `MinutaError` code and say how
to fix the problem.

## Migrating

See [MIGRATION.md](MIGRATION.md) for the changes from 1.x. 2.0 periods hold
Temporal values with an exclusive end; the date-library adapters are gone.

## License

Apache-2.0
