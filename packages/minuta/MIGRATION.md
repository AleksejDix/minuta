# Migrating from 1.x to 2.0

minuta 2.0 computes with Temporal only: periods hold `Temporal.PlainDate`s
(days and larger) or `Temporal.ZonedDateTime`s (hours and smaller), a period
ends where the next one starts, the date-library adapters are gone, and every
function comes from one entry. The full guide, with examples for minuta,
the React and Vue bindings, datefield and fechita, is on the docs site:
[Migrating from 1.x](https://dix.consulting/minuta/migration/).

| 1.x                                                                             | 2.0                                                                            |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `Date` in and out                                                               | `Temporal.PlainDate` for days and larger, `Temporal.ZonedDateTime` for sub-day |
| `end` is the last millisecond                                                   | `end` is the start of the next period: `[start, end)`                          |
| `@aleksejdix/minuta/core`, `/calendar`, `/intervals`, `/format`                 | One entry, `@aleksejdix/minuta`, with every function                           |
| `nativeUnits`, `dateFnsUnits`, `luxonUnits`, `dayjsUnits` …                     | `createUnits` from `@aleksejdix/minuta`                                        |
| `dateFnsTzUnits({ timeZone })`                                                  | `createUnits({ timeZone })`                                                    |
| `temporalUnits` from `@aleksejdix/minuta/temporal`                              | `createUnits`; that entry now has only `temporalReady`                         |
| `withUnits(units, { plugins: [calendar] })`, `bind(units, calendar)`            | `withUnits(units)`: every function, the same names                             |
| `periodWith(units, …)`, `monthGridWith(units, …)` and every other `…With`       | `period(…)`, `monthGrid(…)`, or `withUnits(units).period(…)`                   |
| `snapWith(units, date, unit, { step, mode })`, `time.snap(…)`                   | `round(value, { smallestUnit, roundingIncrement, roundingMode })`              |
| `duration(period, unit)`, `durationWith(units, period, unit)`                   | `count(period, unit)`                                                          |
| `same(a, b, "custom")`                                                          | `equals(a, b)`                                                                 |
| `formatPeriod(period, locale, options)`, `formatRange(period, locale, options)` | `toLocaleString(period, locales, options)`                                     |
| `length(period)`                                                                | `period.start.until(period.end)`                                               |
| datefield `toDate`, `fromDate`                                                  | `toPlainDate`, `toPlainDateTime`, `toPlainTime`, `fromTemporal`                |
| fechita `result.date`                                                           | `result.value` and `result.kind`                                               |
