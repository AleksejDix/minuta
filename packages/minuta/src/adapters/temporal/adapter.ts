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
import { Temporal } from "@js-temporal/polyfill";
import type { WeekStartsOn } from "./units/index";
import { hasTemporal } from "./temporal-api";

const MONDAY = 1;

if (!hasTemporal(globalThis)) {
  Object.assign(globalThis, { Temporal });
}

function temporalUnits({
  weekStartsOn = MONDAY,
}: Readonly<{ weekStartsOn?: WeekStartsOn }> = {}): AllUnits {
  if (!hasTemporal(globalThis)) {
    throw new Error("Temporal API is not available in this environment.");
  }

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

export { temporalUnits };
