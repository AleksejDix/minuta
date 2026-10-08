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

function nativeUnits({
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

export { nativeUnits };
