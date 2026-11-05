import type {
  DateSpec,
  PlainDate,
  TimeSpec,
  Unit,
  Units,
  ZonedDateTime,
} from "#src/types";
import {
  assertPositiveInteger,
  nextStart,
  specFor,
  timeSpecFor,
} from "#src/units";
import { compare, isPlainDate } from "#src/values";
import { getTemporal } from "#src/temporal-api";

const DEFAULT_STEP = 1;
const EQUAL = 0;

/** How `snap` / `snapWith` picks the boundary. */
type SnapMode = "ceil" | "floor" | "nearest";

/**
 * Options for `snap` / `snapWith`.
 */
type SnapOptions = Readonly<{
  /** `"floor"`, `"ceil"` or `"nearest"` (ties round up). Default: `"nearest"`. */
  mode?: SnapMode | undefined;
  /** How many units lie between boundaries. Default: 1. */
  step?: number | undefined;
}>;

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

type Snap<Kind extends Value> = Readonly<{
  /** How far one value lies before another, to find the nearest */
  distance: (from: Kind, to: Kind) => bigint;
  /** Where steps count from without an enclosing unit */
  epoch: Kind;
  line: Line<Kind>;
  mode: SnapMode;
  /** The enclosing unit's line, or none for weeks and years */
  outer: Line<Kind> | undefined;
  step: number;
  value: Kind;
}>;

type Request<Kind extends Value> = Readonly<{
  mode: SnapMode;
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
function anchorOf<Kind extends Value>(snap: Snap<Kind>): Kind {
  if (snap.outer === undefined) {
    return snap.line.startOf(snap.epoch);
  }
  return snap.outer.startOf(snap.value);
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
function steppedBounds<Kind extends Value>(snap: Snap<Kind>): Bounds<Kind> {
  const { line, step } = snap;
  const anchor = anchorOf(snap);
  const first = Math.floor(line.diff(anchor, snap.value) / step) * step;
  const floor = line.add(anchor, first);
  const next = line.add(anchor, first + step);
  return capped(snap.outer, anchor, { floor, next });
}

function boundsOf<Kind extends Value>(snap: Snap<Kind>): Bounds<Kind> {
  if (snap.step === DEFAULT_STEP) {
    const floor = snap.line.startOf(snap.value);
    return { floor, next: snap.line.next(floor) };
  }
  return steppedBounds(snap);
}

function snapped<Kind extends Value>(snap: Snap<Kind>): Kind {
  const { mode, value } = snap;
  const { floor, next } = boundsOf(snap);
  if (compare(floor, value) === EQUAL) {
    return value;
  }
  if (mode === "floor") {
    return floor;
  }
  if (
    mode === "ceil" ||
    snap.distance(floor, value) >= snap.distance(value, next)
  ) {
    return next;
  }
  return floor;
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

function snapDate(
  units: Units,
  spec: DateSpec,
  request: Request<PlainDate>
): PlainDate {
  return snapped({
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

function snapMoment(
  units: Units,
  request: Request<ZonedDateTime>
): ZonedDateTime {
  const { unit, value } = request;
  return snapped({
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
 * `snapWith` without its overloads, for the bound `snap` of `intervals`.
 *
 * @param units - Available unit specs
 * @param value - The date or moment to snap
 * @param unit - The unit whose boundaries to snap to
 * @param options - `step` (units between boundaries) and `mode`
 * @returns The boundary, of the value's kind
 */
// oxlint-disable-next-line eslint/max-params -- Context-first core signature: (units, value, unit, options)
function snapAny(
  units: Units,
  value: PlainDate | ZonedDateTime,
  unit: Unit,
  options: SnapOptions = {}
): PlainDate | ZonedDateTime {
  const { mode = "nearest", step = DEFAULT_STEP } = options;
  assertPositiveInteger(step, "snapWith() step");
  if (!isPlainDate(value)) {
    return snapMoment(units, { mode, step, unit, value });
  }
  const spec: DateSpec | TimeSpec = specFor(units, unit);
  if (spec.kind === "time") {
    throw new TypeError(
      `A date snaps to date units, not to "${unit}": snap a ZonedDateTime instead.`
    );
  }
  return snapDate(units, spec, { mode, step, unit, value });
}

export { snapAny };
export type { SnapMode, SnapOptions };
