import {
  createDayHandler,
  createHourHandler,
  createMinuteHandler,
  createMonthHandler,
  createQuarterHandler,
  createSecondHandler,
  createYearHandler,
} from "./handlers";
import type { Adapter } from "#src/types";
import type { Day } from "date-fns";
import { createAdapter } from "#src/adapters/create-adapter";
import { createWeekHandler } from "./units/week";

const MONDAY = 1;
const DEFAULT_TIMEZONE = "UTC";

function createDateFnsTzAdapter({
  timezone = DEFAULT_TIMEZONE,
  weekStartsOn = MONDAY,
}: Readonly<{
  timezone?: string;
  weekStartsOn?: Day;
}> = {}): Adapter {
  return createAdapter({
    day: createDayHandler(timezone),
    hour: createHourHandler(timezone),
    minute: createMinuteHandler(timezone),
    month: createMonthHandler(timezone),
    quarter: createQuarterHandler(timezone),
    second: createSecondHandler(timezone),
    week: createWeekHandler(timezone, weekStartsOn),
    year: createYearHandler(timezone),
  });
}

const dateFnsTzAdapter: Adapter = createDateFnsTzAdapter({
  timezone: DEFAULT_TIMEZONE,
  weekStartsOn: MONDAY,
});

export { createDateFnsTzAdapter, dateFnsTzAdapter };
