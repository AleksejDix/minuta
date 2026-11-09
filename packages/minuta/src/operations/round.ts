import type {
  DateSpec,
  PlainDate,
  TimeSpec,
  Unit,
  Units,
  ZonedDateTime,
} from "#src/types";
import type { RoundTo, RoundingMode } from "./round-options";
import {
  assertPositiveInteger,
  nextStart,
  specFor,
  timeSpecFor,
} from "#src/units";
import { compare, isPlainDate } from "#src/values";
import { requestOf, roundsDown, roundsUp, tiesDown } from "./round-options";
import { getTemporal } from "#src/temporal-api";

const DEFAULT_STEP = 1;
const EQUAL = 0;

const EVEN = 2;

// Steps count from the start of the enclosing unit, so they follow the clock
const ENCLOSING: Readonly<Partial<Record<string, Unit>>> = {
  day: "month",
  hour: "day",
  minute: "hour",
  month: "year",
  quarter: "year",
  second: "minute",
};

// Midday UTC on Jan 1 1970 lies in the same week in every time zone
const EPOCH_INSTANT = "1970-01-01T12:00:00Z";
const EPOCH_DATE = "1970-01-01";

type Value = PlainDate | ZonedDateTime;

/** A unit's boundaries around a value. */
type Bounds<Kind extends Value> = Readonly<{ floor: Kind; next: Kind }>;

/** A unit on one kind of value: its start, the next start, and counting. */
type Line<Kind extends Value> = Readonly<{
  add: (value: Kind, amount: number) => Kind;
  diff: (from: Kind, to: Kind) => number;
  next: (start: Kind) => Kind;
  startOf: (value: Kind) => Kind;
}>;

type Rounding<Kind extends Value> = Readonly<{
  /** How far one value lies before another, to find the nearest */
  distance: (from: Kind, to: Kind) => bigint;
  /** Where steps count from without an enclosing unit */
  epoch: Kind;
  line: Line<Kind>;
  mode: RoundingMode;
  /** The enclosing unit's line, or none for weeks and years */
  outer: Line<Kind> | undefined;
  step: number;
  value: Kind;
}>;

type Request<Kind extends Value> = Readonly<{
  mode: RoundingMode;
  step: number;
  unit: Unit;
  value: Kind;
}>;

function dateLine(spec: DateSpec): Line<PlainDate> {
  return {
    add: spec.add,
    diff: spec.diff,
    next: (start) => spec.add(start, DEFAULT_STEP),
    startOf: spec.startOf,
  };
}

function timeLine(spec: TimeSpec): Line<ZonedDateTime> {
  return {
    add: spec.add,
    diff: spec.diff,
    next: (start) => nextStart(spec, start),
    startOf: spec.startOf,
  };
}

function daysBetween(from: PlainDate, to: PlainDate): bigint {
  return BigInt(from.until(to, { largestUnit: "day" }).days);
}

function nanosecondsBetween(from: ZonedDateTime, to: ZonedDateTime): bigint {
  return to.epochNanoseconds - from.epochNanoseconds;
}

// Where steps count from: the enclosing unit's start, else the epoch's unit
function anchorOf<Kind extends Value>(rounding: Rounding<Kind>): Kind {
  if (rounding.outer === undefined) {
    return rounding.line.startOf(rounding.epoch);
  }
  return rounding.outer.startOf(rounding.value);
}

// The bounds, with `next` no later than the end of the enclosing unit
function capped<Kind extends Value>(
  outer: Line<Kind> | undefined,
  anchor: Kind,
  bounds: Bounds<Kind>
): Bounds<Kind> {
  if (outer === undefined) {
    return bounds;
  }
  const limit = outer.next(anchor);
  if (compare(bounds.next, limit) > EQUAL) {
    return { floor: bounds.floor, next: limit };
  }
  return bounds;
}

// The boundaries every `step` units from the anchor, capped at the enclosing unit's end
function steppedBounds<Kind extends Value>(
  rounding: Rounding<Kind>
): Bounds<Kind> {
  const { line, step } = rounding;
  const anchor = anchorOf(rounding);
  const first = Math.floor(line.diff(anchor, rounding.value) / step) * step;
  const floor = line.add(anchor, first);
  const next = line.add(anchor, first + step);
  return capped(rounding.outer, anchor, { floor, next });
}

// The lower boundary on a tie: halfEven takes the even one from the anchor
function tieGoesDown<Kind extends Value>(
  rounding: Rounding<Kind>,
  bounds: Bounds<Kind>
): boolean {
  if (rounding.mode === "halfEven") {
    const { line, step } = rounding;
    const index = line.diff(anchorOf(rounding), bounds.floor) / step;
    return Math.abs(index % EVEN) === EQUAL;
  }
  return tiesDown(rounding.mode);
}

// The nearer boundary, ties by the mode
function nearer<Kind extends Value>(
  rounding: Rounding<Kind>,
  bounds: Bounds<Kind>
): Kind {
  const below = rounding.distance(bounds.floor, rounding.value);
  const above = rounding.distance(rounding.value, bounds.next);
  if (below < above || (below === above && tieGoesDown(rounding, bounds))) {
    return bounds.floor;
  }
  return bounds.next;
}

function boundsOf<Kind extends Value>(rounding: Rounding<Kind>): Bounds<Kind> {
  if (rounding.step !== DEFAULT_STEP) {
    return steppedBounds(rounding);
  }
  const floor = rounding.line.startOf(rounding.value);
  return { floor, next: rounding.line.next(floor) };
}

function rounded<Kind extends Value>(rounding: Rounding<Kind>): Kind {
  const bounds = boundsOf(rounding);
  if (compare(bounds.floor, rounding.value) === EQUAL) {
    return rounding.value;
  }
  if (roundsDown(rounding.mode)) {
    return bounds.floor;
  }
  if (roundsUp(rounding.mode)) {
    return bounds.next;
  }
  return nearer(rounding, bounds);
}

// The enclosing unit's spec on dates, when there is one
function outerDateLine(units: Units, unit: Unit): Line<PlainDate> | undefined {
  const enclosing = ENCLOSING[unit];
  if (enclosing === undefined) {
    return undefined;
  }
  const spec: DateSpec | TimeSpec = specFor(units, enclosing);
  if (spec.kind === "time") {
    return undefined;
  }
  return dateLine(spec);
}

// The enclosing unit's spec on moments, when there is one
function outerTimeLine(
  units: Units,
  unit: Unit
): Line<ZonedDateTime> | undefined {
  const enclosing = ENCLOSING[unit];
  if (enclosing === undefined) {
    return undefined;
  }
  return timeLine(timeSpecFor(units, enclosing));
}

function roundDate(
  units: Units,
  spec: DateSpec,
  request: Request<PlainDate>
): PlainDate {
  return rounded({
    distance: daysBetween,
    epoch: getTemporal()
      .PlainDate.from(EPOCH_DATE)
      .withCalendar(request.value.calendarId),
    line: dateLine(spec),
    mode: request.mode,
    outer: outerDateLine(units, request.unit),
    step: request.step,
    value: request.value,
  });
}

function roundMoment(
  units: Units,
  request: Request<ZonedDateTime>
): ZonedDateTime {
  const { unit, value } = request;
  return rounded({
    distance: nanosecondsBetween,
    epoch: getTemporal()
      .Instant.from(EPOCH_INSTANT)
      .toZonedDateTimeISO(value.timeZoneId)
      .withCalendar(value.calendarId),
    line: timeLine(timeSpecFor(units, unit)),
    mode: request.mode,
    outer: outerTimeLine(units, unit),
    step: request.step,
    value,
  });
}

/**
 * Round a date or a moment to a boundary of `roundingIncrement` units: the
 * unit's start, or every n-th one counted from the start of the enclosing
 * unit (minutes from the hour, hours from the day, days from the month,
 * months and quarters from the year; weeks and years from 1970). Temporal's
 * `round()`, extended to weeks, months, quarters and years. A date rounds to
 * dates; a moment to moments in its zone, for date units to the start of a
 * day.
 *
 * @example
 * roundWith(units, Temporal.ZonedDateTime.from("2026-03-15T10:37[Europe/Zurich]"), { smallestUnit: "minute", roundingIncrement: 15 }); // 10:30
 * roundWith(units, Temporal.ZonedDateTime.from("2026-03-15T10:37[Europe/Zurich]"), { smallestUnit: "day", roundingMode: "ceil" }); // Mar 16 00:00
 * roundWith(units, Temporal.PlainDate.from("2026-03-18"), { smallestUnit: "week", roundingMode: "floor" }); // 2026-03-16
 *
 * @param units - Available unit specs
 * @param value - The date or moment to round
 * @param roundTo - The unit, or `smallestUnit`, `roundingIncrement` and `roundingMode`
 * @returns The boundary, of the value's kind; `value` itself when it is one
 * @throws {TypeError} For a date and a time unit: dates round to date units
 */
function roundWith(
  units: Units,
  value: PlainDate | ZonedDateTime,
  roundTo: RoundTo
): PlainDate | ZonedDateTime {
  const { mode, step, unit } = requestOf(roundTo);
  assertPositiveInteger(step, "round() roundingIncrement");
  if (!isPlainDate(value)) {
    return roundMoment(units, { mode, step, unit, value });
  }
  const spec: DateSpec | TimeSpec = specFor(units, unit);
  if (spec.kind === "time") {
    throw new TypeError(
      `A date rounds to date units, not to "${unit}": round a ZonedDateTime instead.`
    );
  }
  return roundDate(units, spec, { mode, step, unit, value });
}

export { roundWith };
