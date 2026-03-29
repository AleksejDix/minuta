import type { Adapter, TimePeriod } from "../types";

/**
 * A single hour slot in a stable 24-hour day grid.
 */
export interface HourSlot extends TimePeriod {
  /** Wall-clock hour (0-23) */
  hour: number;
}

/**
 * A stable 24-hour grid for a given day, with DST metadata.
 */
export interface StableDay {
  slots: HourSlot[];
  /** Wall-clock hour that doesn't exist due to spring forward, or null */
  gapHour: number | null;
  /** Wall-clock hour that occurs twice due to fall back, or null */
  ambiguousHour: number | null;
}

const ONE_HOUR_MS = 3600000;
const NORMAL_DAY_MS = 24 * ONE_HOUR_MS;

function wallClockHour(date: Date, timezone: string): number {
  const h = parseInt(
    new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      hour12: false,
    }).format(date)
  );
  return h === 24 ? 0 : h;
}

/**
 * Creates a stable 24-hour grid for a given day.
 * Always returns exactly 24 hour slots (0-23), regardless of DST.
 *
 * @param adapter - The date adapter to use
 * @param date - Any date within the target day
 * @param timezone - IANA timezone string (e.g. "America/New_York").
 *   Required for correct DST gap/ambiguous detection.
 *
 * @example
 * import { createStableDay } from "minuta/calendar";
 * const { slots, gapHour, ambiguousHour } = createStableDay(adapter, new Date(2024, 2, 10), "America/New_York");
 * slots.length // always 24
 * gapHour      // 2 — 2 AM doesn't exist (US spring forward)
 */
export function createStableDay(
  adapter: Adapter,
  date: Date,
  timezone: string
): StableDay {
  const dayStart = adapter.startOf(date, "day");
  const dayEnd = adapter.endOf(date, "day");
  const dayDurationMs = dayEnd.getTime() - dayStart.getTime() + 1;

  // Detect DST type from total day duration
  const isShortDay = dayDurationMs < NORMAL_DAY_MS; // spring forward (23h)
  const isLongDay = dayDurationMs > NORMAL_DAY_MS; // fall back (25h)

  const slots: HourSlot[] = [];
  let gapHour: number | null = null;
  let ambiguousHour: number | null = null;

  for (let hour = 0; hour < 24; hour++) {
    const start = adapter.add(dayStart, hour, "hour");
    const end = new Date(start.getTime() + ONE_HOUR_MS - 1);
    slots.push({ start, end, type: "hour", hour });
  }

  // Use Intl.DateTimeFormat to get the true wall-clock hour for each slot.
  // This is system-TZ-independent, unlike date-fns-tz's toZonedTime approach.
  if (isShortDay || isLongDay) {
    for (let hour = 1; hour < 24; hour++) {
      const wallClock = wallClockHour(slots[hour].start, timezone);

      // Gap (spring forward): wall-clock jumps ahead of slot index.
      if (isShortDay && gapHour === null && wallClock > hour) {
        gapHour = hour;
      }

      // Ambiguous (fall back): wall-clock falls behind slot index.
      if (isLongDay && ambiguousHour === null && wallClock < hour) {
        ambiguousHour = wallClock;
      }
    }
  }

  return { slots, gapHour, ambiguousHour };
}
