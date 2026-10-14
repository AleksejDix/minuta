import { add, differenceInWeeks, endOfWeek, startOfWeek } from "date-fns";
import type { Day } from "date-fns";
import type { UnitSpec } from "#src/types";
import type { Zone } from "#src/adapters/date-fns-tz/handlers";
import { instant } from "#src/adapters/date-fns-tz/handlers";

function createWeekHandler(zone: Zone, weekStartsOn: Day): UnitSpec {
  const options = { in: zone.in, weekStartsOn };
  return {
    add: (date: Readonly<Date>, amount: number): Date =>
      instant(add(date, { weeks: amount }, zone)),
    diff: (from: Readonly<Date>, to: Readonly<Date>): number =>
      differenceInWeeks(to, from, zone),
    endOf: (date: Readonly<Date>): Date => instant(endOfWeek(date, options)),
    startOf: (date: Readonly<Date>): Date =>
      instant(startOfWeek(date, options)),
  };
}

export { createWeekHandler };
