# minuta

Divide time into pieces. Pure functions over plain, readonly data, computed
with [Temporal](https://tc39.es/proposal-temporal/docs/).

```bash
npm install @aleksejdix/minuta
```

| What you import                                                 | minified + brotli |
| --------------------------------------------------------------- | ----------------- |
| `minuta`: `period`, `next`, `divide`                            | 2.0 kB            |
| `@aleksejdix/minuta/core` with only the `day` and `month` units | 1.6 kB            |
| Calendar grids through `bind`                                   | 2.2 kB            |
| `temporalUnits` from `@aleksejdix/minuta/temporal`              | 1.4 kB            |

Zero dependencies, ES modules only, `sideEffects: false`. Budgets are
checked on every CI run. Where the runtime has no Temporal yet (Safari,
Node 24), install `@js-temporal/polyfill` and `await temporalReady()` from
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
import { divide, period } from "@aleksejdix/minuta";

const year = period(Temporal.PlainDate.from("2026-01-01"), "year");
const months = divide(year, "month"); // 12 periods
const march = months[2]; // { start: 2026-03-01, end: 2026-04-01, unit: "month" }
const days = march === undefined ? [] : divide(march, "day"); // 31 periods
```

The default entry is bound to the Temporal units with weeks starting on
Monday (ISO 8601) and moments in the runtime's zone, so there is nothing to
configure.

## Operations

| Family   | Functions                                                         |
| -------- | ----------------------------------------------------------------- |
| Create   | `period(value, unit)` · `range(start, end)`                       |
| Navigate | `next(period)` · `previous(period)` · `shift(period, steps)`      |
| Compose  | `divide(period, unit, { step })`                                  |
| Compare  | `contains(period, value)` · `overlaps(a, b)` · `same(a, b, unit)` |
| Ask      | `duration(period, unit)` · `length(period)`                       |

Interval helpers and calendar functions are [plugins](#plugins) in their own
entries, so they cost nothing until you import them.

```ts
import {
  contains,
  duration,
  next,
  period,
  previous,
  range,
  shift,
} from "@aleksejdix/minuta";

const march = period(Temporal.PlainDate.from("2026-03-15"), "month");
next(march); // April
previous(march); // February
shift(march, 3); // June
contains(march, Temporal.PlainDate.from("2026-03-20")); // true
contains(march, Temporal.PlainDate.from("2026-04-01")); // false: the end is excluded

range(
  Temporal.PlainDate.from("2026-01-01"),
  Temporal.PlainDate.from("2026-04-01")
); // January to March

duration(march, "day"); // 31
duration(period(Temporal.PlainDate.from("2026-03-29"), "day"), "hour"); // 23 in Europe/Zurich (DST)
```

Errors are a `RangeError` whose message starts with a `MinutaError` code such
as `UNIT_NOT_SUPPORTED`. No result is ever `null`; a missing one is
`undefined`.

## Other week starts and time zones

Rules and data are separate. Units are plain data made by `temporalUnits`;
bind them once and you get the same operations:

```ts
import { withUnits } from "@aleksejdix/minuta/core";
import { temporalUnits } from "@aleksejdix/minuta/temporal";

const time = withUnits(
  temporalUnits({ timeZone: "UTC", weekStartsOn: "sunday" })
);
time.period(Temporal.Now.plainDateISO(), "week"); // starts on Sunday
time.divide(time.period(Temporal.Now.plainDateISO(), "day"), "hour"); // the day's hours in UTC
```

Days are named (`"monday"`); the numbers 0 (Sunday) to 6 (Saturday) work
too. `timeZone` is where dates become moments, as when a day is divided into
hours; a `ZonedDateTime` passed in keeps its own zone.

The bound object's members have exactly the types of the default entry, so
the two cannot drift apart.

## The pure core

`@aleksejdix/minuta/core` has the rules without bound data. Unit-aware functions take the
units first; unit-free functions take none:

```ts
import { nextWith, periodWith } from "@aleksejdix/minuta/core";
import { temporalUnits } from "@aleksejdix/minuta/temporal";

const { day, month } = temporalUnits();
const units = { day, month }; // only what you use ends up in the bundle

nextWith(units, periodWith(units, Temporal.Now.plainDateISO(), "month"));
```

A unit missing from `units` throws a `RangeError` starting with
`UNIT_NOT_SUPPORTED`.

## Plugins

A plugin is an object of context-first functions. Pass it to `withUnits` and
its functions join the operations, bound to the same units. Two ship with
minuta:

| Entry                          | Plugin      | Functions                                                                                                                                                                           |
| ------------------------------ | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@aleksejdix/minuta/calendar`  | `calendar`  | `monthGrid(value)` · `yearGrid(value)` · `dayGrid(value)` · `isWeekday(period)` · `isWeekend(period)`                                                                               |
| `@aleksejdix/minuta/intervals` | `intervals` | `merge(periods, unit?)` · `split(period, at)` · `gap(a, b)` · `clamp(period, bounds)` · `move(period, start)` · `resize(period, edge, value)` · `snap(value, unit, { step, mode })` |

```ts
import { calendar } from "@aleksejdix/minuta/calendar";
import { intervals } from "@aleksejdix/minuta/intervals";
import { temporalUnits } from "@aleksejdix/minuta/temporal";
import { withUnits } from "@aleksejdix/minuta/core";

const time = withUnits(
  temporalUnits({ weekStartsOn: "sunday", weekend: ["friday", "saturday"] }),
  { plugins: [calendar, intervals] }
);
const today = Temporal.Now.plainDateISO();
time.monthGrid(today).periods; // always 42 days: no layout jumps
time.yearGrid(today).periods; // whole weeks covering the year
time.dayGrid(today).periods; // the day's real hours: 23, 24 or 25
time.isWeekend(time.period(Temporal.PlainDate.from("2026-03-20"), "day")); // true: a Friday
time.snap(Temporal.Now.zonedDateTimeISO(), "minute", { step: 15 }); // the nearest quarter hour
time.next(time.period(today, "week")); // the operations, same units
time.units; // the units it was built with
```

The `weekend` lives in the units like the week start, so `isWeekend` and
`isWeekday` follow it. `merge([])`, `clamp` without overlap, `split` outside
the period and `gap` between touching periods return `undefined`.

Member names must be unique: a plugin function named like an operation or
like another plugin's is a type error. `bind(units, plugin)` binds a plugin on
its own.

Write your own the same way:

```ts
import type { DatePeriod, Units } from "@aleksejdix/minuta/core";
import { bind, divideWith } from "@aleksejdix/minuta/core";
import { temporalUnits } from "@aleksejdix/minuta/temporal";
import { period } from "@aleksejdix/minuta";

const workdays = {
  workdaysIn: (units: Units, month: DatePeriod) =>
    divideWith(units, month, "day").filter((day) => day.start.dayOfWeek < 6),
};

const march = period(Temporal.PlainDate.from("2026-03-01"), "month");
bind(temporalUnits(), workdays).workdaysIn(march); // 22 day periods
```

Custom units are data too: add the name and its kind to `UnitRegistry`
through module augmentation (`fortnight: "date"`) and pass its spec
(`kind`, `startOf`, `add`, `diff`) in your units.

## Formatting

```ts
import { formatPeriod, formatRange } from "@aleksejdix/minuta/format";
import { period, range } from "@aleksejdix/minuta";

formatPeriod(period(Temporal.PlainDate.from("2026-03-15"), "month"), "de-CH"); // "März 2026"
formatRange(
  range(
    Temporal.PlainDate.from("2026-03-30"),
    Temporal.PlainDate.from("2026-04-06")
  ),
  "de-CH"
); // "30. März – 5. Apr. 2026"
formatPeriod(period(Temporal.PlainDate.from("2026-03-15"), "day"), "en-US", {
  weekday: "short",
}); // "Sun"
```

A date period shows its first and last day; a time period its start and
end, in its own zone. The text is the same with native Temporal and the
polyfill, on a server and in the browser. Options that pick fields
(`month`, `weekday`, `dateStyle` …) replace the unit's defaults; others are
added to them.

## For coding agents

The package ships [`llms.txt`](llms.txt): every export with its signature,
description and example, the naming rules and all error codes on one page.
It is generated from the source and checked in CI (`npm run docs:llms`
regenerates it). Error messages start with a `MinutaError` code and say how
to fix the problem.

## Migrating

See [MIGRATION.md](MIGRATION.md) for the changes from the adapter-based API.
2.0 periods hold Temporal values with an exclusive end; the date-library
adapters are gone.

## License

Apache-2.0
