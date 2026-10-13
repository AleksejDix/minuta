---
title: dayjsUnits
description: Units computed with Day.js — for apps that already use Day.js, in the computer's time zone.
---

Units computed with [Day.js](https://day.js.org), the small date library
with a Moment-like API. Dates are read in the time zone of the computer the
code runs on.

```ts
import { dayjsUnits } from "minuta/dayjs";
```

```ts
dayjsUnits(options?)
```

## Example

```ts
import { dayjsUnits } from "minuta/dayjs";
import { withUnits } from "minuta/core";

const time = withUnits(dayjsUnits({ weekStartsOn: "sunday" }));

time.period(new Date(2026, 2, 18), "week");
// → { start: Sun Mar 15 00:00, end: Sat Mar 21 23:59:59.999, unit: "week" }
```

minuta takes and returns plain `Date` objects. Convert at the edges:
`dayjs(period.start)` and `value.toDate()`.

## When to choose it

- Your app already uses Day.js and you want its rules everywhere.

The results are the same as with [`nativeUnits`](../native-units/).

## Install

```sh
npm install minuta dayjs
```

Day.js is not a dependency of minuta; install it yourself. minuta is tested
with Day.js 1.11.

## Parameters

| Name      | What it is                                                 |
| --------- | ---------------------------------------------------------- |
| `options` | Optional. Week start and weekend, see [Options](#options). |

## Options

| Option         | Default                  | What it does                                                                               |
| -------------- | ------------------------ | ------------------------------------------------------------------------------------------ |
| `weekStartsOn` | `"monday"`               | The first day of the week: `"sunday"` … `"saturday"`, or 0 (Sunday) … 6 (Saturday).        |
| `weekend`      | `["saturday", "sunday"]` | The days that [`isWeekendWith`](../../minuta-calendar/is-weekend-with/) counts as weekend. |

The week start does not come from the Day.js locale. It is Monday unless
you set it. There is no time zone option.

## Returns

The units: a spec for each of `year`, `quarter`, `month`, `week`, `day`,
`hour`, `minute` and `second`, plus `timeZone` (the computer's zone, e.g.
`"Europe/Zurich"`), `weekStartsOn` (a number) and `weekend` (numbers).

## Things to know

- **It extends your Day.js.** Importing `minuta/dayjs` calls
  `dayjs.extend(quarterOfYear)` on the shared `dayjs` instance, so the
  quarter plugin is active in the rest of your app too.

:::caution
Importing `minuta/dayjs` in Node without a bundler currently fails with
`ERR_MODULE_NOT_FOUND` for `dayjs/plugin/quarterOfYear`. Bundlers such as
esbuild resolve it.
:::

## Related

- [All date engines](../overview/) — compare the engines.
- [`momentUnits`](../moment-units/) — the same idea with Moment.
- [`withUnits`](../../minuta-core/with-units/) — bind the units to all operations.
