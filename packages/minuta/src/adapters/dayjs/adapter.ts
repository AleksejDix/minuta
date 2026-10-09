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

const MONDAY = 1;

const SUNDAY = 0;
const TUESDAY = 2;
const WEDNESDAY = 3;
const THURSDAY = 4;
const FRIDAY = 5;
const SATURDAY = 6;

type WeekStartsOn =
  | typeof SUNDAY
  | typeof MONDAY
  | typeof TUESDAY
  | typeof WEDNESDAY
  | typeof THURSDAY
  | typeof FRIDAY
  | typeof SATURDAY;

/**
 * Unit specs for every unit, computed with Day.js (requires the `dayjs` package). Pass the result to
 * `withUnits`, to any `…With` function in `minuta/core`, or to a plugin via
 * `bind`. Weeks start on Monday unless `weekStartsOn` says otherwise
 * (0 = Sunday … 6 = Saturday).
 *
 * @example
 * import { dayjsUnits } from "minuta/dayjs";
 * import { withUnits } from "minuta/core";
 *
 * const time = withUnits(dayjsUnits({ weekStartsOn: 1 }));
 * time.period(new Date(), "week");
 *
 * @param options - Week start
 * @returns A spec for every unit
 */
function dayjsUnits(
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

export { dayjsUnits };
