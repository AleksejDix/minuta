/**
 * The clock of a format: the reference moments every part is measured on,
 * the hour cycle, and the texts of the day periods.
 */

import type { FormatToken, HourCycle } from "./types";

const REFERENCE_YEAR = 2026;
/** Zero-based: 10 is November */
const REFERENCE_MONTH_INDEX = 10;
const REFERENCE_DAY = 13;
// Two digits on every clock: 22 on 24-hour clocks, 10 on 12-hour ones
const REFERENCE_HOUR = 22;
const MORNING_HOUR = 9;
const REFERENCE_MINUTE = 35;
const REFERENCE_SECOND = 47;
const REFERENCE_MILLISECOND = 123;

/**
 * A reference date that produces unambiguous parts:
 * day=13, month=11, year=2026, hour=22, minute=35, second=47 — no single-digit ambiguity.
 */
const REFERENCE_DATE: Readonly<Date> = new Date(
  REFERENCE_YEAR,
  REFERENCE_MONTH_INDEX,
  REFERENCE_DAY,
  REFERENCE_HOUR,
  REFERENCE_MINUTE,
  REFERENCE_SECOND,
  REFERENCE_MILLISECOND
);

// The same moment in the morning, for the first day period's text
const MORNING_DATE = new Date(
  REFERENCE_YEAR,
  REFERENCE_MONTH_INDEX,
  REFERENCE_DAY,
  MORNING_HOUR,
  REFERENCE_MINUTE
);

const HOUR_CYCLES: ReadonlySet<string> = new Set(["h11", "h12", "h23", "h24"]);

// What a format's hour and day period tokens carry
type ClockInfo = Readonly<{
  hourCycle: HourCycle | undefined;
  periods: readonly string[];
}>;

function isHourCycle(cycle: string | undefined): cycle is HourCycle {
  return cycle !== undefined && HOUR_CYCLES.has(cycle);
}

function periodOf(
  fmt: Readonly<Intl.DateTimeFormat>,
  date: Readonly<Date>
): string {
  const found = fmt
    .formatToParts(date)
    .find(
      (part: Readonly<Intl.DateTimeFormatPart>) => part.type === "dayPeriod"
    );
  if (found === undefined) {
    return "";
  }
  return found.value;
}

function cycleOf(fmt: Readonly<Intl.DateTimeFormat>): HourCycle | undefined {
  const { hourCycle } = fmt.resolvedOptions();
  if (isHourCycle(hourCycle)) {
    return hourCycle;
  }
  return undefined;
}

function clockOf(fmt: Readonly<Intl.DateTimeFormat>): ClockInfo {
  return {
    hourCycle: cycleOf(fmt),
    periods: [periodOf(fmt, MORNING_DATE), periodOf(fmt, REFERENCE_DATE)],
  };
}

// An hour token with its clock's cycle, a day period with its texts
function clockToken(
  type: "dayPeriod" | "hour",
  length: number,
  clock: ClockInfo
): FormatToken {
  if (type === "dayPeriod") {
    const width = Math.max(...clock.periods.map((period) => period.length));
    return { length: width, options: clock.periods, type };
  }
  return { hourCycle: clock.hourCycle, length, type };
}

/**
 * The options without `dayPeriod`: a field types the short day periods
 * (AM, PM), not the long ones ("in the morning").
 *
 * @param options - Intl options
 * @returns The options to format with
 */
function withShortPeriods(
  options: Readonly<Intl.DateTimeFormatOptions>
): Intl.DateTimeFormatOptions {
  return Object.fromEntries(
    Object.entries(options).filter(
      ([key]: readonly [string, unknown]) => key !== "dayPeriod"
    )
  );
}

export { REFERENCE_DATE, clockOf, clockToken, withShortPeriods };
export type { ClockInfo };
