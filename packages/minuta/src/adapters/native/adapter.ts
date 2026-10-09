import { weekStartOf, weekendOf } from "#src/weekday";
import type { AllUnits } from "#src/types";
import type { WeekOptions } from "#src/weekday";
import { createWeekHandler } from "./units/week";
import { dayHandler } from "./units/day";
import { hourHandler } from "./units/hour";
import { minuteHandler } from "./units/minute";
import { monthHandler } from "./units/month";
import { quarterHandler } from "./units/quarter";
import { secondHandler } from "./units/second";
import { yearHandler } from "./units/year";

/**
 * Unit specs for every unit, computed with the built-in `Date` (zero dependencies). Pass the result to
 * `withUnits`, to any `…With` function in `minuta/core`, or to a plugin via
 * `bind`. Weeks start on Monday unless `weekStartsOn` says otherwise
 * (`"sunday"` … `"saturday"`, or 0 = Sunday … 6 = Saturday); `weekend` sets
 * the days `isWeekend` counts (Saturday and Sunday unless set).
 *
 * @example
 * import { nativeUnits } from "minuta/native";
 * import { withUnits } from "minuta/core";
 *
 * const time = withUnits(nativeUnits({ weekStartsOn: "sunday" }));
 * time.period(new Date(), "week");
 *
 * @param options - Week start and weekend
 * @returns A spec for every unit
 */
function nativeUnits(options: WeekOptions = {}): AllUnits {
  return {
    day: dayHandler,
    hour: hourHandler,
    minute: minuteHandler,
    month: monthHandler,
    quarter: quarterHandler,
    second: secondHandler,
    week: createWeekHandler(weekStartOf(options)),
    weekend: weekendOf(options),
    year: yearHandler,
  };
}

export { nativeUnits };
