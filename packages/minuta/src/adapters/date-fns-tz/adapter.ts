import {
  createDayHandler,
  createHourHandler,
  createMinuteHandler,
  createMonthHandler,
  createQuarterHandler,
  createSecondHandler,
  createYearHandler,
} from "./handlers";
import type { AllUnits } from "#src/types";
import type { WeekOptions } from "#src/weekday";
import { adapterUnits } from "#src/adapters/adapter-units";
import { createWeekHandler } from "./units/week";
import { tz } from "@date-fns/tz";

const DEFAULT_TIMEZONE = "UTC";

/**
 * Unit specs for every unit, computed with date-fns in one IANA time zone (requires `date-fns` and `@date-fns/tz`). Pass the result to
 * `withUnits`, to any `…With` function in `minuta/core`, or to a plugin via
 * `bind`. Weeks start on Monday unless `weekStartsOn` says otherwise
 * (`"sunday"` … `"saturday"`, or 0 = Sunday … 6 = Saturday); `weekend` sets
 * the days `isWeekend` counts (Saturday and Sunday unless set).
 *
 * @example
 * import { dateFnsTzUnits } from "@aleksejdix/minuta/date-fns-tz";
 * import { withUnits } from "@aleksejdix/minuta/core";
 *
 * const time = withUnits(dateFnsTzUnits({ timeZone: "Europe/Zurich", weekStartsOn: "monday" }));
 * time.period(new Date(), "week");
 *
 * @param options - Week start, weekend, time zone
 * @returns A spec for every unit
 */
function dateFnsTzUnits(
  options: WeekOptions & Readonly<{ timeZone?: string }> = {}
): AllUnits {
  const { timeZone: timezone = DEFAULT_TIMEZONE } = options;
  const zone = { in: tz(timezone), name: timezone };
  return adapterUnits(
    options,
    (weekStartsOn) => ({
      day: createDayHandler(zone),
      hour: createHourHandler(zone),
      minute: createMinuteHandler(zone),
      month: createMonthHandler(zone),
      quarter: createQuarterHandler(zone),
      second: createSecondHandler(zone),
      week: createWeekHandler(zone, weekStartsOn),
      year: createYearHandler(zone),
    }),
    timezone
  );
}

export { dateFnsTzUnits };
