# Migrating to the reworked minuta core

The core follows one rule now: **rules and data are separate.** Units (`day`,
`week`, `month`, …) are plain data produced by an adapter; operations are pure
functions. The default entry has the native units bound, so most code needs no
adapter at all. This guide lists every change that can affect existing code.

## Imports and entry points

| Before                                                                                                                                                | Now                                                                                                              |
| ----------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `import { next, divide } from "minuta/operations"` with an adapter argument                                                                           | `import { next, divide } from "minuta"` — bound to the native units, weeks start on Monday                       |
| `minuta/operations`                                                                                                                                   | removed. Context-first functions live in `minuta/core`, bound ones in `minuta`                                   |
| `minuta/helpers` (`isWeekend`, `isWeekday`, `isToday`, `isOverlapping`)                                                                               | removed. `isWeekend`, `isWeekday`, `overlaps` and `isToday` are regular operations in `minuta` and `minuta/core` |
| `createNativeAdapter({ weekStartsOn })`                                                                                                               | `nativeUnits({ weekStartsOn })`                                                                                  |
| `createDateFnsAdapter`, `createDateFnsTzAdapter`, `createDayjsAdapter`, `createLuxonAdapter`, `createMomentAdapter`, `createMinutaAdapter` (Temporal) | `dateFnsUnits`, `dateFnsTzUnits`, `dayjsUnits`, `luxonUnits`, `momentUnits`, `temporalUnits`                     |
| Prebuilt instances `nativeFunctionalAdapter`, `dateFnsAdapter`, `dateFnsTzAdapter`, `luxonAdapter`, `minutaAdapter`                                   | removed. Call the factory                                                                                        |

Other week starts or other date libraries: bind your units once.

```ts
import { withUnits } from "minuta/core";
import { luxonUnits } from "minuta/luxon";

const time = withUnits(luxonUnits({ weekStartsOn: "sunday" }));
time.next(time.period(new Date(), "week"));
```

## Renamed functions

| Before                                          | Default entry (`minuta`)                     | Core (`minuta/core`)                                    |
| ----------------------------------------------- | -------------------------------------------- | ------------------------------------------------------- |
| `derivePeriod(adapter, date, unit)`             | `period(date, unit)`                         | `periodWith(units, date, unit)`                         |
| `createPeriod(start, end)`                      | `range(start, end)`                          | `range(start, end)`                                     |
| `go(adapter, period, steps)`                    | `shift(period, steps)`                       | `shiftWith(units, period, steps)`                       |
| `next(adapter, period)`                         | `next(period)`                               | `nextWith(units, period)`                               |
| `previous(adapter, period)`                     | `previous(period)`                           | `previousWith(units, period)`                           |
| `divide(adapter, period, unit, count, options)` | `divide(period, unit, { step, maxPeriods })` | `divideWith(units, period, unit, { step, maxPeriods })` |
| `isSame(adapter, a, b, unit)`                   | `same(a, b, unit)`                           | `sameWith(units, a, b, unit)`                           |
| `isToday(adapter, now, period)`                 | `isToday(now, period)`                       | `isTodayWith(units, now, period)`                       |
| `duration(period, unit)`                        | `duration(period, unit)`                     | `durationWith(units, period, unit)`                     |
| `merge(periods, unit)`                          | `merge(periods, unit)`                       | `mergeWith(units, periods, unit)`                       |
| `snap(date, 15 * 60_000, mode)`                 | `snap(date, "minute", { step: 15, mode })`   | `snapWith(units, date, "minute", { step: 15, mode })`   |
| `duration(period)` (milliseconds)               | `length(period)`                             | `length(period)`                                        |
| `isOverlapping(a, b)`                           | `overlaps(a, b)`                             | `overlaps(a, b)`                                        |

`contains`, `gap`, `move`, `resize`, `clamp` and `split` keep their names and
take no units. `isWeekday` and `isWeekend` read the weekend from the units:
`isWeekdayWith(units, period)` and `isWeekendWith(units, period)` in
`minuta/core`.

## Results that change

| Function                                                 | Before                                                                                         | Now                                                                                                     | What to do                                              |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `range` (was `createPeriod`)                             | Threw when `start` was after `end`                                                             | Swaps the dates                                                                                         | Nothing, unless you relied on the error                 |
| `period`, `range`                                        | Threw `Error("Period contains invalid date …")`                                                | Throw `RangeError` whose message starts with `INVALID_DATE`                                             | Match `MinutaError.InvalidDate` instead of the message  |
| `clamp`, `resize`                                        | Returned `null`                                                                                | Return `undefined`                                                                                      | Check for `undefined`                                   |
| Day grid `gapHour`, `ambiguousHour`                      | `null` when there is no DST hour                                                               | `undefined`                                                                                             | Check for `undefined`                                   |
| `duration(period, unit)`                                 | Truncated milliseconds: one unit short (a day was 0 days), DST ignored, only `day` to `second` | Counts complete units by the calendar, DST-aware, every unit                                            | Drop any `+ 1` workaround                               |
| `merge(periods, unit)`                                   | Always labelled the result `unit`, even when it was not one such period                        | Keeps `unit` only for exactly one aligned period, otherwise `"custom"`                                  | Check `unit` before relying on it                       |
| `split(period, date)`                                    | Returned a zero-length part for a date outside the period; both parts kept the unit            | Returns `undefined` unless the date is after the start and within the period; both parts are `"custom"` | Check for `undefined`                                   |
| `isWeekday`, `isWeekend`                                 | Only periods under 2 days could be true; Saturday and Sunday were fixed                        | True when every day the period touches is a working or weekend day; the weekend comes from the units    | Set `weekend` in the adapter options for other weekends |
| Day grid `periods`                                       | Always 24 slots, labelled by index; spilled into the next day or dropped an hour on DST days   | The day's real hours (23, 24 or 25), labelled with the wall-clock hour in `units.timeZone`              | Drop the `timeZone` argument; use the adapter's zone    |
| `merge([])`                                              | Threw                                                                                          | Returns `undefined`                                                                                     | Check for `undefined`                                   |
| `divide` over `maxPeriods`                               | Threw `Error`                                                                                  | Throws `RangeError`                                                                                     | Catch `RangeError`                                      |
| Any unit-aware function with a unit missing from `units` | —                                                                                              | Throws `RangeError` starting with `UNIT_NOT_SUPPORTED`                                                  | Pass the unit, or an adapter's full set                 |

## Types

- **`Period.type` is `Period.unit`.** `{ start, end, unit }`, deeply readonly.
- **`ReadonlyPeriod` is gone.** `Period` is readonly itself.
- **`AdapterUnit` is `Unit`.** The `UnitRegistry` interface stays for module augmentation.
- **`Adapter` is gone.** Unit-aware functions take `Units`, a partial map of
  `UnitSpec` (`{ startOf, endOf, add, diff }` for one unit). Adapters return
  `AllUnits`. `UnitHandler` is `UnitSpec`.
- **`StableMonth`, `StableYear`, `StableDay`** are `MonthGrid`, `YearGrid`, `DayGrid`.

## Calendar grids

The grids take units like every other unit-aware function. The week start
comes from the `week` unit, so there is no separate `weekStartsOn` argument.

| Before                                           | Now                                                  |
| ------------------------------------------------ | ---------------------------------------------------- |
| `createStableMonth(adapter, weekStartsOn, date)` | `monthGridWith(nativeUnits({ weekStartsOn }), date)` |
| `createStableYear(adapter, weekStartsOn, date)`  | `yearGridWith(nativeUnits({ weekStartsOn }), date)`  |
| `createStableDay(adapter, date, timeZone)`       | `dayGridWith(units, date)`                           |

Or bind the `calendar` plugin once:

```ts
import { bind } from "minuta/core";
import { calendar } from "minuta/calendar";
import { nativeUnits } from "minuta/native";

const grids = bind(nativeUnits({ weekStartsOn: "sunday" }), calendar);
grids.monthGrid(new Date()).periods; // 42 day periods
```

Or bind it together with the operations:

```ts
import { calendar } from "minuta/calendar";
import { nativeUnits } from "minuta/native";
import { withUnits } from "minuta/core";

const time = withUnits(nativeUnits(), { plugins: [calendar] });
time.monthGrid(time.next(time.period(new Date(), "month")).start);
```
