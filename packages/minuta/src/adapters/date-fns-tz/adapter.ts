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

const DEFAULT_TIMEZONE = "UTC";

/**
 * Unit specs for every unit, computed with date-fns-tz in one IANA time zone (requires `date-fns` and `date-fns-tz`). Pass the result to
 * `withUnits`, to any `…With` function in `minuta/core`, or to a plugin via
 * `bind`. Weeks start on Monday unless `weekStartsOn` says otherwise
 * (`"sunday"` … `"saturday"`, or 0 = Sunday … 6 = Saturday); `weekend` sets
 * the days `isWeekend` counts (Saturday and Sunday unless set).
 *
 * @example
 * import { dateFnsTzUnits } from "minuta/date-fns-tz";
 * import { withUnits } from "minuta/core";
 *
 * const time = withUnits(dateFnsTzUnits({ timezone: "Europe/Zurich", weekStartsOn: "monday" }));
 * time.period(new Date(), "week");
 *
 * @param options - Week start, weekend, time zone
 * @returns A spec for every unit
 */
function dateFnsTzUnits(
  options: WeekOptions & Readonly<{ timezone?: string }> = {}
): AllUnits {
  const { timezone = DEFAULT_TIMEZONE } = options;
  return adapterUnits(
    options,
    (weekStartsOn) => ({
      day: createDayHandler(timezone),
      hour: createHourHandler(timezone),
      minute: createMinuteHandler(timezone),
      month: createMonthHandler(timezone),
      quarter: createQuarterHandler(timezone),
      second: createSecondHandler(timezone),
      week: createWeekHandler(timezone, weekStartsOn),
      year: createYearHandler(timezone),
    }),
    timezone
  );
}

export { dateFnsTzUnits };
