import type { TimePeriod, TimeValue, Units } from "#src/types";
import { isZoned, toPlainDate, zonedPeriod } from "#src/values";
import { divideWith } from "#src/operations/divide";
import { periodWith } from "#src/operations/period";
import { timeZoneOf } from "#src/units";

/**
 * One real hour of a day, labelled with its wall-clock hour.
 */
type HourSlot = TimePeriod &
  Readonly<{
    /** Wall-clock hour (0-23) the slot starts in, in the day's zone */
    hour: number;
  }>;

/**
 * The real hours of a day: 23, 24 or 25 slots, with the skipped and the
 * repeated wall-clock hour.
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
const ONE_HOUR = 1;
const SKIPPED_HOURS = 2;

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

// The zone the day lies in: a moment's own, else the units'
function zoneOf(units: Units, value: TimeValue): string {
  if (isZoned(value)) {
    return value.timeZoneId;
  }
  return timeZoneOf(units);
}

/**
 * The real hours of the day containing `value`: 23 on a spring-forward day,
 * 25 on a fall-back day, 24 otherwise. The day lies in the zone of a moment
 * passed in, else in the units' time zone; each slot carries the wall-clock
 * hour it starts in.
 *
 * @example
 * import { dayGridWith } from "@aleksejdix/minuta/calendar";
 *
 * const units = createUnits({ timeZone: "America/New_York" });
 * const { periods, gapHour } = dayGridWith(units, Temporal.PlainDate.from("2024-03-10"));
 * periods.length; // 23
 * gapHour; // 2
 *
 * @param units - Units with `day` and `hour` specs
 * @param value - Any value in the day
 * @returns The hour slots with the skipped and repeated hour
 */
function dayGridWith(units: Units, value: TimeValue): DayGrid {
  const timeZone = zoneOf(units, value);
  const day = periodWith(units, toPlainDate(value, timeZone), "day");
  const periods: HourSlot[] = divideWith(
    units,
    zonedPeriod(day, timeZone),
    "hour"
  ).map((slot): HourSlot => ({
    end: slot.end,
    hour: slot.start.hour,
    start: slot.start,
    unit: slot.unit,
  }));
  const { ambiguousHour, gapHour } = detectDstHours(periods);
  return { ambiguousHour, gapHour, periods };
}

export { dayGridWith };
export type { HourSlot, DayGrid };
