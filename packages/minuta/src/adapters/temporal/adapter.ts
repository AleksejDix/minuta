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
import type { Adapter } from "#src/types";
import { Temporal } from "@js-temporal/polyfill";
import type { WeekStartsOn } from "./units/index";
import { createAdapter } from "#src/adapters/create-adapter";
import { hasTemporal } from "./temporal-api";

const MONDAY = 1;

if (!hasTemporal(globalThis)) {
  Object.assign(globalThis, { Temporal });
}

function createMinutaAdapter({
  weekStartsOn = MONDAY,
}: Readonly<{ weekStartsOn?: WeekStartsOn }> = {}): Adapter {
  if (!hasTemporal(globalThis)) {
    throw new Error("Temporal API is not available in this environment.");
  }

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

const minutaAdapter: Adapter = createMinutaAdapter({ weekStartsOn: MONDAY });

export { createMinutaAdapter, minutaAdapter };
