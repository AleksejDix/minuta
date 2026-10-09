# minuta

Divide time into pieces. Pure functions over plain, readonly data, with the
date engine of your choice plugged in as data.

```bash
npm install minuta
```

| What you import                                     | minified + brotli |
| --------------------------------------------------- | ----------------- |
| `minuta`: `period`, `next`, `divide`                | 2.4 kB            |
| `minuta/core` with only the `day` and `month` units | 1.1 kB            |
| Calendar grids through `bind`                       | 1.8 kB            |
| An adapter (without its date library)               | 0.3–1.1 kB        |

Zero dependencies, ES modules only, `sideEffects: false`. Budgets are
checked on every CI run.

## The model

Every time range is a **Period**: `{ start, end, unit }`. `divide` splits any
period into smaller ones. That is the whole model.

```ts
import { divide, period } from "minuta";

const year = period(new Date(2026, 0, 1), "year");
const months = divide(year, "month"); // 12 periods
const days = divide(months[2], "day"); // 31 periods (March)
const quarters = divide(days[0], "minute", { step: 15 }); // 96 periods
```

The default entry is bound to the native `Date` units with weeks starting on
Monday (ISO 8601), so there is nothing to configure.

## Operations

| Family   | Functions                                                                                                        |
| -------- | ---------------------------------------------------------------------------------------------------------------- |
| Create   | `period(date, unit)` · `range(start, end)`                                                                       |
| Navigate | `next(period)` · `previous(period)` · `shift(period, steps)`                                                     |
| Compose  | `divide(period, unit, { step })` · `merge(periods, unit?)` · `split(period, date)`                               |
| Compare  | `contains(period, dateOrPeriod)` · `overlaps(a, b)` · `same(a, b, unit)` · `gap(a, b)`                           |
| Edit     | `move(period, start)` · `resize(period, edge, date)` · `clamp(period, bounds)` · `snap(date, ms)`                |
| Ask      | `duration(period, unit)` · `length(period)` · `isToday(now, period)` · `isWeekday(period)` · `isWeekend(period)` |

```ts
import {
  contains,
  duration,
  next,
  period,
  previous,
  range,
  shift,
} from "minuta";

const march = period(new Date(2026, 2, 15), "month");
next(march); // April
previous(march); // February
shift(march, 3); // June
contains(march, new Date(2026, 2, 20)); // true

range(new Date(2026, 0, 1), new Date(2026, 2, 31)); // { unit: "custom", … }

duration(march, "day"); // 31
duration(period(new Date(2026, 2, 29), "day"), "hour"); // 23 in Europe/Zurich (DST)
```

No result is `undefined` (`clamp` without overlap, `merge([])`, `split` outside
the period), never `null`.
Invalid dates throw a `RangeError` whose message starts with a `MinutaError`
code such as `INVALID_DATE`.

## Other week starts and date libraries

Rules and data are separate. Units are plain data produced by an adapter; bind
them once and you get the same operations:

```ts
import { withUnits } from "minuta/core";
import { nativeUnits } from "minuta/native";

const time = withUnits(nativeUnits({ weekStartsOn: 0 }));
time.period(new Date(), "week"); // starts on Sunday
```

| Adapter                           | Import                                     |
| --------------------------------- | ------------------------------------------ |
| Native `Date` (zero dependencies) | `nativeUnits` from `minuta/native`         |
| date-fns                          | `dateFnsUnits` from `minuta/date-fns`      |
| date-fns-tz (time zones)          | `dateFnsTzUnits` from `minuta/date-fns-tz` |
| Day.js                            | `dayjsUnits` from `minuta/dayjs`           |
| Luxon                             | `luxonUnits` from `minuta/luxon`           |
| Moment                            | `momentUnits` from `minuta/moment`         |
| Temporal                          | `temporalUnits` from `minuta/temporal`     |

The bound object's members have exactly the types of the default entry, so
the two cannot drift apart.

## The pure core

`minuta/core` has the rules without bound data. Unit-aware functions take the
units first; unit-free functions take none:

```ts
import { nextWith, periodWith } from "minuta/core";
import { nativeUnits } from "minuta/native";

const { day, month } = nativeUnits();
const units = { day, month }; // only what you use ends up in the bundle

nextWith(units, periodWith(units, new Date(), "month"));
```

A unit missing from `units` throws a `RangeError` starting with
`UNIT_NOT_SUPPORTED`.

## Plugins

A plugin is an object of context-first functions. `bind` gives it the same
convenience as the default entry. The calendar grids ship as one:

```ts
import { bind } from "minuta/core";
import { calendar } from "minuta/calendar";
import { nativeUnits } from "minuta/native";

const grids = bind(nativeUnits({ weekStartsOn: 0 }), calendar);
grids.monthGrid(new Date()).periods; // always 42 days: no layout jumps
grids.yearGrid(new Date()).periods; // whole weeks covering the year
grids.dayGrid(new Date(), "Europe/Zurich").gapHour; // DST-aware hour slots
```

Write your own the same way:

```ts
import type { Period, Units } from "minuta/core";
import { bind, divideWith } from "minuta/core";
import { nativeUnits } from "minuta/native";
import { period } from "minuta";

const workdays = {
  workdaysIn: (units: Units, month: Period) =>
    divideWith(units, month, "day").filter(
      (day) => day.start.getDay() % 6 !== 0
    ),
};

const march = period(new Date(2026, 2, 1), "month");
bind(nativeUnits(), workdays).workdaysIn(march); // 22 day periods
```

Custom units are data too: add the name to `UnitRegistry` through module
augmentation and pass its `UnitSpec` (`startOf`, `endOf`, `add`, `diff`) in
your units.

## Formatting

```ts
import { formatPeriod, formatRange } from "minuta/format";
import { period, range } from "minuta";

formatPeriod(period(new Date(2026, 2, 15), "month"), "de-CH"); // "März 2026"
formatRange(range(new Date(2026, 2, 30), new Date(2026, 3, 5)), "de-CH"); // "30. März – 5. Apr. 2026"
```

## For coding agents

The package ships [`llms.txt`](llms.txt): every export with its signature,
description and example, the naming rules and all error codes on one page.
It is generated from the source and checked in CI (`npm run docs:llms`
regenerates it). Error messages start with a `MinutaError` code and say how
to fix the problem.

## Migrating

See [MIGRATION.md](MIGRATION.md) for the changes from the adapter-based API.

## License

Apache-2.0
