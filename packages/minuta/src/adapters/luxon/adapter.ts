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
import type { WeekStartsOn } from "./units/week";
import { createWeekHandler } from "./units/week";

const MONDAY = 1;

/**
 * Unit specs for every unit, computed with Luxon (requires the `luxon` package). Pass the result to
 * `withUnits`, to any `…With` function in `minuta/core`, or to a plugin via
 * `bind`. Weeks start on Monday unless `weekStartsOn` says otherwise
 * (0 = Sunday … 6 = Saturday).
 *
 * @example
 * import { luxonUnits } from "minuta/luxon";
 * import { withUnits } from "minuta/core";
 *
 * const time = withUnits(luxonUnits({ weekStartsOn: 1 }));
 * time.period(new Date(), "week");
 *
 * @param options - Week start
 * @returns A spec for every unit
 */
function luxonUnits(
  options: Readonly<{ weekStartsOn?: WeekStartsOn }> = {}
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

export { luxonUnits };
