import type { Adapter } from "../../types";
import { createAdapter } from "../createAdapter";
import { Temporal } from "@js-temporal/polyfill";
import { yearHandler } from "./units/year";
import { quarterHandler } from "./units/quarter";
import { monthHandler } from "./units/month";
import { createWeekHandler } from "./units/week";
import { dayHandler } from "./units/day";
import { hourHandler } from "./units/hour";
import { minuteHandler } from "./units/minute";
import { secondHandler } from "./units/second";

if (typeof (globalThis as any).Temporal === "undefined") {
  (globalThis as any).Temporal = Temporal;
}

export function createMinutaAdapter({
  weekStartsOn = 1,
}: { weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6 } = {}): Adapter {
  if (typeof (globalThis as any).Temporal === "undefined") {
    throw new Error("Temporal API is not available in this environment.");
  }

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

export const minutaAdapter = createMinutaAdapter({ weekStartsOn: 1 });
