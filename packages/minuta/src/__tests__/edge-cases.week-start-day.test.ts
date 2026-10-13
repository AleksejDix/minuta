import { describe, expect, it } from "vitest";
import type { AllUnits } from "#src/types";
import { dateFnsUnits } from "#src/adapters/date-fns/index";
import { dayjsUnits } from "#src/adapters/dayjs/index";
import { luxonUnits } from "#src/adapters/luxon/index";
import { momentUnits } from "#src/adapters/moment/index";
import { nativeUnits } from "#src/adapters/native/index";
import { periodWith } from "#src/operations/period";
import { temporalUnits } from "#src/adapters/temporal/index";

/*
 * A week that starts on Sunday or Saturday starts before Monday. The day it
 * starts on belongs to its own week, not to the one before.
 */
const SUNDAY = 0;
const SATURDAY = 6;

type WeekStart = typeof SATURDAY | typeof SUNDAY;
type Create = (weekStartsOn: WeekStart) => AllUnits;

const ENGINES: readonly (readonly [name: string, create: Create])[] = [
  ["Native", (weekStartsOn) => nativeUnits({ weekStartsOn })],
  ["date-fns", (weekStartsOn) => dateFnsUnits({ weekStartsOn })],
  ["Day.js", (weekStartsOn) => dayjsUnits({ weekStartsOn })],
  ["Luxon", (weekStartsOn) => luxonUnits({ weekStartsOn })],
  ["Moment.js", (weekStartsOn) => momentUnits({ weekStartsOn })],
  ["Temporal", (weekStartsOn) => temporalUnits({ weekStartsOn })],
];

// Sunday Oct 11 and Saturday Oct 10 2026, at noon on the computer's clock
const SUNDAY_NOON = new Date("2026-10-11T12:00");
const SATURDAY_NOON = new Date("2026-10-10T12:00");
const SUNDAY_START = new Date("2026-10-11T00:00");
const SATURDAY_START = new Date("2026-10-10T00:00");

describe.each(ENGINES)("the first day of the week with %s", (_name, create) => {
  it("a Sunday starts its own Sunday week", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const week = periodWith(create(SUNDAY), SUNDAY_NOON, "week");
    expect(week.start).toStrictEqual(SUNDAY_START);
    expect(week.end.getTime()).toBeGreaterThan(SUNDAY_NOON.getTime());
  });

  it("a Saturday starts its own Saturday week", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const week = periodWith(create(SATURDAY), SATURDAY_NOON, "week");
    expect(week.start).toStrictEqual(SATURDAY_START);
    expect(week.end.getTime()).toBeGreaterThan(SATURDAY_NOON.getTime());
  });
});
