import {
  day,
  hour,
  minute,
  month,
  quarter,
  second,
  weekSpec,
  year,
} from "./specs";
import { weekStartOf, weekendOf } from "#src/weekday";
import type { AllUnits } from "#src/types";
import type { WeekOptions } from "#src/weekday";
import { runtimeTimeZone } from "#src/values";

/**
 * Options of `temporalUnits`: the week, the weekend and the time zone.
 */
type TemporalUnitsOptions = WeekOptions &
  Readonly<{
    /**
     * IANA time zone that dates become moments in, e.g. when a day is
     * divided into hours: `"UTC"`, `"Europe/Zurich"`. Default: the runtime's.
     */
    timeZone?: string | undefined;
  }>;

/**
 * Unit specs for every unit, computed with the TC39 Temporal API: date
 * units on `PlainDate`, time units on `ZonedDateTime`. Pass the result to
 * `withUnits`, to any `…With` function in `minuta/core`, or to a plugin via
 * `bind`. Weeks start on Monday unless `weekStartsOn` says otherwise
 * (`"sunday"` … `"saturday"`, or 0 = Sunday … 6 = Saturday); `weekend` sets
 * the days `isWeekend` counts (Saturday and Sunday unless set); `timeZone`
 * is where dates become moments. Where the runtime has no Temporal,
 * `await temporalReady()` first.
 *
 * @example
 * import { temporalUnits } from "@aleksejdix/minuta/temporal";
 * import { withUnits } from "@aleksejdix/minuta/core";
 *
 * const time = withUnits(temporalUnits({ timeZone: "UTC", weekStartsOn: "sunday" }));
 * time.period(Temporal.PlainDate.from("2026-03-18"), "week"); // [Mar 15, Mar 22)
 *
 * @param options - Week start, weekend and time zone
 * @returns A spec for every unit, with the settings
 */
function temporalUnits(options: TemporalUnitsOptions = {}): AllUnits {
  const weekStartsOn = weekStartOf(options);
  return {
    day,
    hour,
    minute,
    month,
    quarter,
    second,
    timeZone: options.timeZone ?? runtimeTimeZone(),
    week: weekSpec(weekStartsOn),
    weekStartsOn,
    weekend: weekendOf(options),
    year,
  };
}

export { temporalUnits };
export type { TemporalUnitsOptions };
