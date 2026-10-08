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

function luxonUnits({
  weekStartsOn = MONDAY,
}: Readonly<{ weekStartsOn?: WeekStartsOn }> = {}): AllUnits {
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
