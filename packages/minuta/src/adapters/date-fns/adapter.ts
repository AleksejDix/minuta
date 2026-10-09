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
import type { WeekOptions } from "#src/weekday";
import { adapterUnits } from "#src/adapters/adapter-units";
import { createWeekHandler } from "./units/week";

/**
 * Unit specs for every unit, computed with date-fns (requires the `date-fns` package). Pass the result to
 * `withUnits`, to any `…With` function in `minuta/core`, or to a plugin via
 * `bind`. Weeks start on Monday unless `weekStartsOn` says otherwise
 * (`"sunday"` … `"saturday"`, or 0 = Sunday … 6 = Saturday); `weekend` sets
 * the days `isWeekend` counts (Saturday and Sunday unless set).
 *
 * @example
 * import { dateFnsUnits } from "minuta/date-fns";
 * import { withUnits } from "minuta/core";
 *
 * const time = withUnits(dateFnsUnits({ weekStartsOn: "monday" }));
 * time.period(new Date(), "week");
 *
 * @param options - Week start and weekend
 * @returns A spec for every unit
 */
function dateFnsUnits(options: WeekOptions = {}): AllUnits {
  return adapterUnits(options, (weekStartsOn) => ({
    day: dayHandler,
    hour: hourHandler,
    minute: minuteHandler,
    month: monthHandler,
    quarter: quarterHandler,
    second: secondHandler,
    week: createWeekHandler(weekStartsOn),
    year: yearHandler,
  }));
}

export { dateFnsUnits };
