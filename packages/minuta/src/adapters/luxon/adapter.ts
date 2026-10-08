import {
  dayHandler,
  hourHandler,
  minuteHandler,
  monthHandler,
  quarterHandler,
  secondHandler,
  yearHandler,
} from "./handlers";
import type { Adapter } from "#src/types";
import type { WeekStartsOn } from "./units/week";
import { createAdapter } from "#src/adapters/create-adapter";
import { createWeekHandler } from "./units/week";

const MONDAY = 1;

function createLuxonAdapter({
  weekStartsOn = MONDAY,
}: Readonly<{ weekStartsOn?: WeekStartsOn }> = {}): Adapter {
  return createAdapter({
    day: dayHandler,
    hour: hourHandler,
    minute: minuteHandler,
    month: monthHandler,
    quarter: quarterHandler,
    second: secondHandler,
    week: createWeekHandler(weekStartsOn),
    year: yearHandler,
  });
}

const luxonAdapter: Adapter = createLuxonAdapter({ weekStartsOn: MONDAY });

export { createLuxonAdapter, luxonAdapter };
