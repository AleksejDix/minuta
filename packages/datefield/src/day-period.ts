/**
 * 12-hour clocks: an hour of 1–12 (h12) or 0–11 (h11) plus a day period, and
 * the 24-hour time they stand for.
 */

import type { HourCycle, Segment } from "./types";
import { valued } from "./segment";

const HOURS_A_HALF_DAY = 12;
const HOURS_A_DAY = 24;
const AM = 0;
const PM = 1;
const NOT_FOUND = -1;
const MIDNIGHT = 0;
const NOON = 12;
const NO_STEP = 0;
// The no-break spaces input-state pads a shorter choice with
const CHOICE_PAD = /\u00A0+$/u;

type Range = Readonly<{ max: number; min: number }>;

const HOUR_RANGES: Readonly<Record<HourCycle, Range>> = {
  h11: { max: 11, min: 0 },
  h12: { max: 12, min: 1 },
  h23: { max: 23, min: 0 },
  h24: { max: 24, min: 1 },
};

/**
 * The hours a clock shows.
 *
 * @param cycle - The clock's hour cycle, `h23` if unknown
 * @returns The first and last hour
 */
function hourRange(cycle: HourCycle | undefined): Range {
  return HOUR_RANGES[cycle ?? "h23"];
}

/**
 * Which day period a segment shows: 0 for the first (AM), 1 for the second.
 *
 * @param seg - A day period segment
 * @returns The index, or -1 while it is empty or shows neither
 */
function periodIndex(seg: Segment): number {
  const shown = seg.value.replace(CHOICE_PAD, "");
  return (seg.options ?? []).indexOf(shown);
}

/**
 * The text a day period segment shows for a 24-hour time.
 *
 * @param seg - The day period segment, or its format token
 * @param hours - Hours of the day, 0–23
 * @param width - The segment's width
 * @returns The day period, padded to the width like input-state does
 */
function periodText(
  seg: Pick<Segment, "options">,
  hours: number,
  width: number
): string {
  const options = seg.options ?? [];
  let index = PM;
  if (hours < NOON) {
    index = AM;
  }
  return (options[index] ?? "").padEnd(width, "\u00A0");
}

/**
 * The text of the day period at `index`, padded to the segment's width.
 *
 * @param seg - A day period segment
 * @param index - 0 for the first day period, 1 for the second
 * @returns The text
 */
function periodAt(seg: Segment, index: number): string {
  const options = seg.options ?? [];
  return (options[index] ?? "").padEnd(seg.end - seg.start, "\u00A0");
}

/**
 * The hour a clock shows for hours of the day 0–23.
 *
 * @param hours - Hours of the day
 * @param cycle - The clock's hour cycle
 * @returns The shown hour
 */
function shownHour(hours: number, cycle: HourCycle | undefined): number {
  if (cycle === "h12") {
    return hours % HOURS_A_HALF_DAY || NOON;
  }
  if (cycle === "h11") {
    return hours % HOURS_A_HALF_DAY;
  }
  if (cycle === "h24") {
    return hours || HOURS_A_DAY;
  }
  return hours;
}

/**
 * The hours of the day 0–23 for a shown hour, or undefined when the clock
 * cannot show it (13 or 0 on an h12 clock).
 *
 * @param hour - The shown hour
 * @param cycle - The clock's hour cycle
 * @param period - The day period index, for h11 and h12
 * @returns Hours of the day, or undefined
 */
function hoursOf(
  hour: number,
  cycle: HourCycle | undefined,
  period: number
): number | undefined {
  const range = hourRange(cycle);
  if (hour < range.min || hour > range.max) {
    return undefined;
  }
  if (cycle === "h12" || cycle === "h11") {
    if (period === NOT_FOUND) {
      return undefined;
    }
    return (hour % HOURS_A_HALF_DAY) + period * HOURS_A_HALF_DAY;
  }
  return hour % HOURS_A_DAY || MIDNIGHT;
}

const PERIODS = 2;
const FIRST_PERIOD = 0;
const LAST_PERIOD = 1;
const NO_PERIOD = -1;

/**
 * Whether a segment is a day period.
 *
 * @param seg - Any segment
 * @returns True for a day period segment
 */
function isDayPeriod(seg: Segment | undefined): boolean {
  return seg !== undefined && seg.type === "dayPeriod";
}

// The other day period, or the first going up and the last going down
function nextPeriod(current: number, direction: number): number {
  if (current !== NO_PERIOD) {
    return (current + LAST_PERIOD) % PERIODS;
  }
  if (direction > NO_STEP) {
    return FIRST_PERIOD;
  }
  return LAST_PERIOD;
}

/**
 * The day period switched: AM to PM and back. An empty one becomes AM going
 * up and PM going down, like a number starts at its first or last value.
 *
 * @param segments - Current segments
 * @param index - Index of the day period segment
 * @param direction - Up or down
 * @returns The segments with the other day period
 */
function switchedPeriod(
  segments: readonly Segment[],
  index: number,
  direction: number
): Segment[] {
  return segments.map((seg, idx) => {
    if (idx !== index) {
      return seg;
    }
    const next = nextPeriod(periodIndex(seg), direction);
    return valued(seg, periodAt(seg, next));
  });
}

export {
  hourRange,
  hoursOf,
  isDayPeriod,
  periodIndex,
  periodText,
  shownHour,
  switchedPeriod,
};
