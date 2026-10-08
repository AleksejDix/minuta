import {
  createWeekHandler,
  dayHandler,
  hourHandler,
  minuteHandler,
  monthHandler,
  quarterHandler,
  secondHandler,
  yearHandler,
} from "./handlers";
import type { Adapter } from "#src/types";
import { createAdapter } from "#src/adapters/create-adapter";

const MONDAY = 1;

const SUNDAY = 0;
const TUESDAY = 2;
const WEDNESDAY = 3;
const THURSDAY = 4;
const FRIDAY = 5;
const SATURDAY = 6;

type WeekStartsOn =
  | typeof SUNDAY
  | typeof MONDAY
  | typeof TUESDAY
  | typeof WEDNESDAY
  | typeof THURSDAY
  | typeof FRIDAY
  | typeof SATURDAY;

function createMomentAdapter({
  weekStartsOn = MONDAY,
}: Readonly<{ weekStartsOn?: WeekStartsOn }> = {}): Adapter {
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

export { createMomentAdapter };
