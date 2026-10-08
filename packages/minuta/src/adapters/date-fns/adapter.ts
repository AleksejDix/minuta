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
import type { Day } from "date-fns";
import { createAdapter } from "#src/adapters/create-adapter";
import { createWeekHandler } from "./units/week";

const MONDAY = 1;

function createDateFnsAdapter({
  weekStartsOn = MONDAY,
}: Readonly<{ weekStartsOn?: Day }> = {}): Adapter {
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

const dateFnsAdapter: Adapter = createDateFnsAdapter({ weekStartsOn: MONDAY });

export { createDateFnsAdapter, dateFnsAdapter };
