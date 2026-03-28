import type { Adapter } from "../../types";
import { createAdapter } from "../createAdapter";
import { yearHandler } from "./units/year";
import { monthHandler } from "./units/month";
import { createWeekHandler } from "./units/week";
import { dayHandler } from "./units/day";
import { hourHandler } from "./units/hour";
import { minuteHandler } from "./units/minute";
import { secondHandler } from "./units/second";
import { quarterHandler } from "./units/quarter";

export function createNativeAdapter({
  weekStartsOn = 1,
}: { weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6 } = {}): Adapter {
  return createAdapter({
    year: yearHandler,
    month: monthHandler,
    week: createWeekHandler(weekStartsOn),
    day: dayHandler,
    hour: hourHandler,
    minute: minuteHandler,
    second: secondHandler,
    quarter: quarterHandler,
  });
}

export const nativeFunctionalAdapter = createNativeAdapter({ weekStartsOn: 1 });
