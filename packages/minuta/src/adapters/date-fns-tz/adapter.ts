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
import type { Day } from "date-fns";
import { createWeekHandler } from "./units/week";

const MONDAY = 1;
const DEFAULT_TIMEZONE = "UTC";

/**
 * Unit specs for every unit, computed with date-fns-tz in one IANA time zone (requires `date-fns` and `date-fns-tz`). Pass the result to
 * `withUnits`, to any `…With` function in `minuta/core`, or to a plugin via
 * `bind`. Weeks start on Monday unless `weekStartsOn` says otherwise
 * (0 = Sunday … 6 = Saturday).
 *
 * @example
 * import { dateFnsTzUnits } from "minuta/date-fns-tz";
 * import { withUnits } from "minuta/core";
 *
 * const time = withUnits(dateFnsTzUnits({ timezone: "Europe/Zurich", weekStartsOn: 1 }));
 * time.period(new Date(), "week");
 *
 * @param options - Week start, time zone
 * @returns A spec for every unit
 */
function dateFnsTzUnits(
  options: Readonly<{
    timezone?: string;
    weekStartsOn?: Day;
  }> = {}
): AllUnits {
  const { timezone = DEFAULT_TIMEZONE, weekStartsOn = MONDAY } = options;
  return {
    day: createDayHandler(timezone),
    hour: createHourHandler(timezone),
    minute: createMinuteHandler(timezone),
    month: createMonthHandler(timezone),
    quarter: createQuarterHandler(timezone),
    second: createSecondHandler(timezone),
    week: createWeekHandler(timezone, weekStartsOn),
    year: createYearHandler(timezone),
  };
}

export { dateFnsTzUnits };
