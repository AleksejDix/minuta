import type { Adapter } from "../../types";
import { createAdapter } from "../createAdapter";
import { createYearHandler } from "./units/year";
import { createQuarterHandler } from "./units/quarter";
import { createMonthHandler } from "./units/month";
import { createWeekHandler } from "./units/week";
import { createDayHandler } from "./units/day";
import { createHourHandler } from "./units/hour";
import { createMinuteHandler } from "./units/minute";
import { createSecondHandler } from "./units/second";

/**
 * Create a timezone-aware date-fns adapter
 *
 * @param options.timezone - IANA timezone string (e.g., 'Europe/Zurich')
 * @param options.weekStartsOn - First day of the week (0 = Sunday, 1 = Monday)
 */
export function createDateFnsTzAdapter({
  timezone = "UTC",
  weekStartsOn = 1,
}: {
  timezone?: string;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
} = {}): Adapter {
  return createAdapter({
    year: createYearHandler(timezone),
    quarter: createQuarterHandler(timezone),
    month: createMonthHandler(timezone),
    week: createWeekHandler(timezone, weekStartsOn),
    day: createDayHandler(timezone),
    hour: createHourHandler(timezone),
    minute: createMinuteHandler(timezone),
    second: createSecondHandler(timezone),
  });
}

export const dateFnsTzAdapter = createDateFnsTzAdapter({
  timezone: "UTC",
  weekStartsOn: 1,
});
