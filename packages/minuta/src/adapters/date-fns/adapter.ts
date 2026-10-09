import {
  dayHandler,
  hourHandler,
  minuteHandler,
  monthHandler,
  quarterHandler,
  secondHandler,
  yearHandler,
} from "./handlers";
import type { AllUnits } from "#src/types";
import type { Day } from "date-fns";
import { createWeekHandler } from "./units/week";

const MONDAY = 1;

/**
 * Unit specs for every unit, computed with date-fns (requires the `date-fns` package). Pass the result to
 * `withUnits`, to any `…With` function in `minuta/core`, or to a plugin via
 * `bind`. Weeks start on Monday unless `weekStartsOn` says otherwise
 * (0 = Sunday … 6 = Saturday).
 *
 * @example
 * import { dateFnsUnits } from "minuta/date-fns";
 * import { withUnits } from "minuta/core";
 *
 * const time = withUnits(dateFnsUnits({ weekStartsOn: 1 }));
 * time.period(new Date(), "week");
 *
 * @param options - Week start
 * @returns A spec for every unit
 */
function dateFnsUnits(
  options: Readonly<{ weekStartsOn?: Day }> = {}
): AllUnits {
  const { weekStartsOn = MONDAY } = options;
  return {
    day: dayHandler,
    hour: hourHandler,
    minute: minuteHandler,
    month: monthHandler,
    quarter: quarterHandler,
    second: secondHandler,
    week: createWeekHandler(weekStartsOn),
    year: yearHandler,
  };
}

export { dateFnsUnits };
