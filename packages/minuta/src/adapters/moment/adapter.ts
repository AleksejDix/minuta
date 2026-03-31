import type { Adapter } from "../../types";
import { createAdapter } from "../createAdapter";
import {
  yearHandler,
  quarterHandler,
  monthHandler,
  createWeekHandler,
  dayHandler,
  hourHandler,
  minuteHandler,
  secondHandler,
} from "./handlers";

export function createMomentAdapter({
  weekStartsOn = 1,
}: { weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6 } = {}): Adapter {
  return createAdapter({
    year: yearHandler,
    quarter: quarterHandler,
    month: monthHandler,
    week: createWeekHandler(weekStartsOn),
    day: dayHandler,
    hour: hourHandler,
    minute: minuteHandler,
    second: secondHandler,
  });
}
