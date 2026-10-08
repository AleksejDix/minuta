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

function dateFnsUnits({
  weekStartsOn = MONDAY,
}: Readonly<{ weekStartsOn?: Day }> = {}): AllUnits {
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
