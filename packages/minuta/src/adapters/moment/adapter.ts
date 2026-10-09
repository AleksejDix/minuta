import {
  createWeekHandler,
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

/**
 * Unit specs for every unit, computed with Moment.js (requires the `moment` package). Pass the result to
 * `withUnits`, to any `…With` function in `minuta/core`, or to a plugin via
 * `bind`. Weeks start on Monday unless `weekStartsOn` says otherwise
 * (`"sunday"` … `"saturday"`, or 0 = Sunday … 6 = Saturday); `weekend` sets
 * the days `isWeekend` counts (Saturday and Sunday unless set).
 *
 * @example
 * import { momentUnits } from "minuta/moment";
 * import { withUnits } from "minuta/core";
 *
 * const time = withUnits(momentUnits({ weekStartsOn: "monday" }));
 * time.period(new Date(), "week");
 *
 * @param options - Week start and weekend
 * @returns A spec for every unit
 */
function momentUnits(options: WeekOptions = {}): AllUnits {
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

export { momentUnits };
