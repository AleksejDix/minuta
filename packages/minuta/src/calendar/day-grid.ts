import type { Period, Series, Units } from "#src/types";
import { specFor } from "#src/units";

/**
 * A single hour slot in a stable 24-hour day grid.
 */
type HourSlot = Period & {
  /** Wall-clock hour (0-23) */
  hour: number;
};

/**
 * A stable 24-hour grid for a given day, with DST metadata.
 */
type DayGrid = Series & {
  periods: HourSlot[];
  /** Wall-clock hour that doesn't exist due to spring forward, or undefined */
  gapHour: number | undefined;
  /** Wall-clock hour that occurs twice due to fall back, or undefined */
  ambiguousHour: number | undefined;
};

type DstHours = Pick<DayGrid, "ambiguousHour" | "gapHour">;

type ReadonlySlot = Readonly<{ hour: number; start: Readonly<Date> }>;

const ONE_HOUR_MS = 3_600_000;
const HOURS_PER_DAY = 24;
const NORMAL_DAY_MS = HOURS_PER_DAY * ONE_HOUR_MS;
const ONE_MS = 1;
const MIDNIGHT = 0;
const FIRST_CHECKED_HOUR = 1;
const HOUR_STEP = 1;
const DECIMAL_RADIX = 10;
const NO_HOUR = undefined;

function wallClockHour(date: Readonly<Date>, timezone: string): number {
  const formatted = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    hour12: false,
    timeZone: timezone,
  }).format(date);
  const hour = Number.parseInt(formatted, DECIMAL_RADIX);
  if (hour === HOURS_PER_DAY) {
    return MIDNIGHT;
  }
  return hour;
}

function buildHourSlots(units: Units, dayStart: Readonly<Date>): HourSlot[] {
  const periods: HourSlot[] = [];
  for (let hour = 0; hour < HOURS_PER_DAY; hour += HOUR_STEP) {
    const start = specFor(units, "hour").add(dayStart, hour);
    const end = new Date(start.getTime() + ONE_HOUR_MS - ONE_MS);
    periods.push({ end, hour, start, unit: "hour" });
  }
  return periods;
}

/*
 * Use Intl.DateTimeFormat to get the true wall-clock hour for each slot.
 * This is system-TZ-independent, unlike date-fns-tz's toZonedTime approach.
 */

// Gap (spring forward): wall-clock jumps ahead of slot index.
function findGapHour(
  slots: readonly ReadonlySlot[],
  timezone: string
): number | undefined {
  for (const slot of slots.slice(FIRST_CHECKED_HOUR)) {
    if (wallClockHour(slot.start, timezone) > slot.hour) {
      return slot.hour;
    }
  }
  return NO_HOUR;
}

// Ambiguous (fall back): wall-clock falls behind slot index.
function findAmbiguousHour(
  slots: readonly ReadonlySlot[],
  timezone: string
): number | undefined {
  for (const slot of slots.slice(FIRST_CHECKED_HOUR)) {
    const wallClock = wallClockHour(slot.start, timezone);
    if (wallClock < slot.hour) {
      return wallClock;
    }
  }
  return NO_HOUR;
}

function detectDstHours(
  slots: readonly ReadonlySlot[],
  timezone: string,
  dayDurationMs: number
): DstHours {
  // Spring forward (23h)
  if (dayDurationMs < NORMAL_DAY_MS) {
    return { ambiguousHour: NO_HOUR, gapHour: findGapHour(slots, timezone) };
  }
  // Fall back (25h)
  if (dayDurationMs > NORMAL_DAY_MS) {
    return {
      ambiguousHour: findAmbiguousHour(slots, timezone),
      gapHour: NO_HOUR,
    };
  }
  return { ambiguousHour: NO_HOUR, gapHour: NO_HOUR };
}

/**
 * Creates a stable 24-hour grid for a given day.
 * Always returns exactly 24 hour periods (0-23), regardless of DST.
 *
 * @param units - Available unit specs (needs `day` and `hour`)
 * @param date - Any date within the target day
 * @param timezone - IANA timezone string (e.g. "America/New_York").
 *   Required for correct DST gap/ambiguous detection.
 * @returns The 24 hour slots plus the DST gap and ambiguous hours
 *
 * @example
 * import { dayGridWith } from "minuta/calendar";
 * const { periods, gapHour, ambiguousHour } = dayGridWith(units, new Date(2024, 2, 10), "America/New_York");
 * periods.length // always 24
 * gapHour      // 2 — 2 AM doesn't exist (US spring forward)
 */
function dayGridWith(
  units: Units,
  date: Readonly<Date>,
  timezone: string
): DayGrid {
  const day = specFor(units, "day");
  const dayStart = day.startOf(date);
  const dayEnd = day.endOf(date);
  const dayDurationMs = dayEnd.getTime() - dayStart.getTime() + ONE_MS;
  const periods = buildHourSlots(units, dayStart);
  const { ambiguousHour, gapHour } = detectDstHours(
    periods,
    timezone,
    dayDurationMs
  );

  return { ambiguousHour, gapHour, periods };
}

export { dayGridWith };
export type { HourSlot, DayGrid };
