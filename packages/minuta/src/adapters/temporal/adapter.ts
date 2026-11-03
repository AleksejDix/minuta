import {
  createWeekHandler,
  dayHandler,
  hourHandler,
  minuteHandler,
  monthHandler,
  quarterHandler,
  secondHandler,
  yearHandler,
} from "./units/index";
import type { AllUnits } from "#src/types";
import type { WeekOptions } from "#src/weekday";
import { adapterUnits } from "#src/adapters/adapter-units";

/**
 * Unit specs for every unit, computed with the TC39 Temporal API (reads the runtime's Temporal when computing; where it is missing, `await temporalReady()` first). Pass the result to
 * `withUnits`, to any `…With` function in `minuta/core`, or to a plugin via
 * `bind`. Weeks start on Monday unless `weekStartsOn` says otherwise
 * (`"sunday"` … `"saturday"`, or 0 = Sunday … 6 = Saturday); `weekend` sets
 * the days `isWeekend` counts (Saturday and Sunday unless set).
 *
 * @example
 * import { temporalUnits } from "@aleksejdix/minuta/temporal";
 * import { withUnits } from "@aleksejdix/minuta/core";
 *
 * const time = withUnits(temporalUnits({ weekStartsOn: "monday" }));
 * time.period(new Date(), "week");
 *
 * @param options - Week start and weekend
 * @returns A spec for every unit
 */
function temporalUnits(options: WeekOptions = {}): AllUnits {
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

export { temporalUnits };
