import type { AllUnits } from "#src/types";
import type { WeekStartsOn } from "./units/week";
import { createWeekHandler } from "./units/week";
import { dayHandler } from "./units/day";
import { hourHandler } from "./units/hour";
import { minuteHandler } from "./units/minute";
import { monthHandler } from "./units/month";
import { quarterHandler } from "./units/quarter";
import { secondHandler } from "./units/second";
import { yearHandler } from "./units/year";

const MONDAY = 1;

/**
 * Unit specs for every unit, computed with the built-in `Date` (zero dependencies). Pass the result to
 * `withUnits`, to any `…With` function in `minuta/core`, or to a plugin via
 * `bind`. Weeks start on Monday unless `weekStartsOn` says otherwise
 * (0 = Sunday … 6 = Saturday).
 *
 * @example
 * import { nativeUnits } from "minuta/native";
 * import { withUnits } from "minuta/core";
 *
 * const time = withUnits(nativeUnits({ weekStartsOn: 0 }));
 * time.period(new Date(), "week");
 *
 * @param options - Week start
 * @returns A spec for every unit
 */
function nativeUnits(
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

export { nativeUnits };
