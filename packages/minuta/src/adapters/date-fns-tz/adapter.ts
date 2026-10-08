import {
  createDayHandler,
  createHourHandler,
  createMinuteHandler,
  createMonthHandler,
  createQuarterHandler,
  createSecondHandler,
  createYearHandler,
} from "./handlers";
import type { AllUnits } from "#src/types";
import type { Day } from "date-fns";
import { createWeekHandler } from "./units/week";

const MONDAY = 1;
const DEFAULT_TIMEZONE = "UTC";

function dateFnsTzUnits({
  timezone = DEFAULT_TIMEZONE,
  weekStartsOn = MONDAY,
}: Readonly<{
  timezone?: string;
  weekStartsOn?: Day;
}> = {}): AllUnits {
  return {
    day: createDayHandler(timezone),
    hour: createHourHandler(timezone),
    minute: createMinuteHandler(timezone),
    month: createMonthHandler(timezone),
    quarter: createQuarterHandler(timezone),
    second: createSecondHandler(timezone),
    week: createWeekHandler(timezone, weekStartsOn),
    year: createYearHandler(timezone),
  };
}

export { dateFnsTzUnits };
