import type { Period, Units } from "#src/types";
import { divideWith } from "#src/operations/divide";
import { periodWith } from "#src/operations/period";

/**
 * One real hour of a day, labelled with its wall-clock hour.
 */
type HourSlot = Period &
  Readonly<{
    /** Wall-clock hour (0-23) in the units' time zone */
    hour: number;
  }>;

/**
 * The real hours of a day: 23, 24 or 25 slots, with DST metadata.
 */
type DayGrid = Readonly<{
  /** The hour slots of the day */
  periods: readonly HourSlot[];
  /** Wall-clock hour that doesn't exist due to spring forward, or undefined */
  gapHour: number | undefined;
  /** Wall-clock hour that occurs twice due to fall back, or undefined */
  ambiguousHour: number | undefined;
}>;

type DstHours = Pick<DayGrid, "ambiguousHour" | "gapHour">;

const HOURS_PER_DAY = 24;
const MIDNIGHT = 0;
const ONE_HOUR = 1;
const SKIPPED_HOURS = 2;
const DECIMAL_RADIX = 10;

function wallClockHour(date: Readonly<Date>, timeZone: string): number {
  const formatted = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    hour12: false,
    timeZone,
  }).format(date);
  const hour = Number.parseInt(formatted, DECIMAL_RADIX);
  if (hour === HOURS_PER_DAY) {
    return MIDNIGHT;
  }
  return hour;
}

function hoursLater(hour: number, hours: number): number {
  return (hour + hours) % HOURS_PER_DAY;
}

/**
 * Find the skipped and the repeated wall-clock hour from consecutive slots.
 *
 * @param slots - The day's slots in order
 * @returns The DST hours, undefined where there are none
 */
function detectDstHours(slots: readonly HourSlot[]): DstHours {
  let ambiguousHour: number | undefined = undefined;
  let gapHour: number | undefined = undefined;
  for (const [index, slot] of slots.entries()) {
    const previous = slots[index - ONE_HOUR];
    if (previous !== undefined) {
      if (slot.hour === previous.hour) {
        ambiguousHour = slot.hour;
      }
      if (slot.hour === hoursLater(previous.hour, SKIPPED_HOURS)) {
        gapHour = hoursLater(previous.hour, ONE_HOUR);
      }
    }
  }
  return { ambiguousHour, gapHour };
}

/**
 * The real hours of the day containing `date`: 23 on a spring-forward day,
 * 25 on a fall-back day, 24 otherwise. Each slot carries its wall-clock hour
 * in `units.timeZone` (the runtime's zone when unset).
 *
 * @example
 * import { dateFnsTzUnits } from "minuta/date-fns-tz";
 * import { dayGridWith } from "minuta/calendar";
 *
 * const units = dateFnsTzUnits({ timeZone: "America/New_York" });
 * const { periods, gapHour } = dayGridWith(units, new Date("2024-03-10T12:00:00Z"));
 * periods.length; // 23
 * gapHour; // 2
 *
 * @param units - Units with `day` and `hour` specs
 * @param date - Any date in the day
 * @returns The hour slots with the skipped and repeated hour
 */
function dayGridWith(units: Units, date: Readonly<Date>): DayGrid {
  const timeZone =
    units.timeZone ?? new Intl.DateTimeFormat().resolvedOptions().timeZone;
  const periods: HourSlot[] = divideWith(
    units,
    periodWith(units, date, "day"),
    "hour"
  ).map((slot): HourSlot => ({
    end: slot.end,
    hour: wallClockHour(slot.start, timeZone),
    start: slot.start,
    unit: slot.unit,
  }));
  const { ambiguousHour, gapHour } = detectDstHours(periods);
  return { ambiguousHour, gapHour, periods };
}

export { dayGridWith };
export type { HourSlot, DayGrid };
