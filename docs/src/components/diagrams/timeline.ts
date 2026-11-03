/**
 * The geometry of a timeline: where a period sits on the axis, and which
 * ticks the axis gets. Used at build time by `Timeline.astro`.
 */
import type {
  Period,
  PlainDate,
  Unit,
  ZonedDateTime,
} from "@aleksejdix/minuta";
import { divide, range } from "@aleksejdix/minuta";

type Bar = Readonly<{
  custom: boolean;
  label: string;
  left: number;
  title: string;
  width: number;
}>;

type Tick = Readonly<{ label: string; left: number }>;

/** The axis: its ends in milliseconds, and as moments in UTC for the ticks. */
type Span = Readonly<{
  end: number;
  last: ZonedDateTime;
  first: ZonedDateTime;
  start: number;
}>;

const UTC = "UTC";
const PERCENT = 100;
const MS_AN_HOUR = 3_600_000;
const MS_A_DAY = 86_400_000;
const MAX_TICKS = 10;
// Ticks and labels closer than this, in percent of the axis, would collide
const MIN_TICK_GAP = 6.5;
// Pins this close to an edge keep their label inside the picture
const EDGE = 12;
const FULL = 100;
const MIN_LABEL_WIDTH = 7;
const ONE = 1;
const LAST = -1;

const MS_A_MINUTE = 60_000;
const DAYS_A_WEEK = 7;
const DAYS_A_MONTH = 30.44;
const MONTHS_A_QUARTER = 3;
const DAYS_A_YEAR = 365.25;

// The finest tick unit first, each with its rough length
const TICK_SIZES: ReadonlyMap<Unit, number> = new Map<Unit, number>([
  ["minute", MS_A_MINUTE],
  ["hour", MS_AN_HOUR],
  ["day", MS_A_DAY],
  ["week", MS_A_DAY * DAYS_A_WEEK],
  ["month", MS_A_DAY * DAYS_A_MONTH],
  ["quarter", MS_A_DAY * DAYS_A_MONTH * MONTHS_A_QUARTER],
  ["year", MS_A_DAY * DAYS_A_YEAR],
]);

// From the finest tick unit to the coarsest
const TICK_UNITS: readonly Unit[] = [
  "minute",
  "hour",
  "day",
  "week",
  "month",
  "quarter",
  "year",
];

const LABELS: ReadonlyMap<Unit, Intl.DateTimeFormatOptions> = new Map<
  Unit,
  Intl.DateTimeFormatOptions
>([
  ["day", { day: "numeric", month: "short", timeZone: UTC }],
  [
    "hour",
    { hour: "2-digit", hourCycle: "h23", minute: "2-digit", timeZone: UTC },
  ],
  [
    "minute",
    { hour: "2-digit", hourCycle: "h23", minute: "2-digit", timeZone: UTC },
  ],
  ["month", { month: "short", timeZone: UTC }],
  ["quarter", { month: "short", timeZone: UTC, year: "numeric" }],
  ["week", { day: "numeric", month: "short", timeZone: UTC }],
  ["year", { timeZone: UTC, year: "numeric" }],
]);

/** A marked value on the axis: a date (its midnight in UTC) or a moment. */
type Marked = PlainDate | ZonedDateTime;

// A date at its midnight in UTC, a moment at its instant, read in UTC
function inUtc(value: Marked): ZonedDateTime {
  if ("epochMilliseconds" in value) {
    return value.withTimeZone(UTC);
  }
  return value.toZonedDateTime({ timeZone: UTC });
}

// Where a value sits on the axis, in milliseconds since 1970 UTC
function epochOf(value: Marked): number {
  return inUtc(value).epochMilliseconds;
}

/**
 * The span the axis covers: from the earliest start to the latest end.
 * Dates sit at their midnight in UTC, moments at their instant, so both
 * kinds share one axis.
 *
 * @param periods - Every period drawn
 * @param marks - Every marked value
 * @returns The span in milliseconds
 */
function spanOf(periods: readonly Period[], marks: readonly Marked[]): Span {
  const moments = [
    ...periods.flatMap((piece) => [inUtc(piece.start), inUtc(piece.end)]),
    ...marks.map((mark) => inUtc(mark)),
  ].toSorted((left, right) => left.epochMilliseconds - right.epochMilliseconds);
  const [first] = moments;
  const last = moments.at(LAST);
  if (first === undefined || last === undefined) {
    throw new RangeError("A timeline needs at least one period or mark");
  }
  return {
    end: last.epochMilliseconds,
    first,
    last,
    start: first.epochMilliseconds,
  };
}

/**
 * Where a moment sits on the axis.
 *
 * @param span - The axis
 * @param time - The moment in milliseconds
 * @returns Its position, in percent of the axis
 */
function position(span: Span, time: number): number {
  return ((time - span.start) / (span.end - span.start)) * PERCENT;
}

// The finest unit that gives at most MAX_TICKS ticks
function tickUnit(span: Span): Unit {
  const length = span.end - span.start;
  const fits = TICK_UNITS.find(
    (unit) => length / (TICK_SIZES.get(unit) ?? length) <= MAX_TICKS
  );
  return fits ?? "year";
}

/**
 * The axis ticks: one per unit, the unit chosen so at most 16 fit.
 *
 * @param span - The axis
 * @returns The ticks, each with a label and a position
 */
function ticksOf(span: Span): Tick[] {
  const unit = tickUnit(span);
  const label = new Intl.DateTimeFormat("en-US", LABELS.get(unit));
  const axis = range(span.first, span.last);
  const ticks = divide(axis, unit).map((piece) => ({
    label: label.format(new Date(epochOf(piece.start))),
    left: position(span, epochOf(piece.start)),
  }));
  return ticks.filter((tick: Tick, index) => {
    const previous = ticks[index - ONE];
    return previous === undefined || tick.left - previous.left >= MIN_TICK_GAP;
  });
}

const CLOCK: Intl.DateTimeFormatOptions = {
  hour: "2-digit",
  hourCycle: "h23",
  minute: "2-digit",
  timeZone: UTC,
};
const DAY: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  timeZone: UTC,
};

// Under a day, a bar is labelled by its times; from a day up, by its dates
function shortLabel(piece: Period): string {
  const start = epochOf(piece.start);
  const length = epochOf(piece.end) - start;
  let format = new Intl.DateTimeFormat("en-US", DAY);
  if (length < MS_A_DAY) {
    format = new Intl.DateTimeFormat("en-US", CLOCK);
  }
  if (length <= MS_AN_HOUR || length === MS_A_DAY) {
    return format.format(new Date(start));
  }
  // The last day or minute shown is the one before the end
  return format.formatRange(
    new Date(start),
    new Date(epochOf(piece.end) - ONE)
  );
}

/**
 * A period as a bar on the axis.
 *
 * @param span - The axis
 * @param piece - The period
 * @returns The bar's position, width, label and tooltip
 */
function barOf(span: Span, piece: Period): Bar {
  const left = position(span, epochOf(piece.start));
  const width = position(span, epochOf(piece.end)) - left;
  let label = "";
  if (width >= MIN_LABEL_WIDTH) {
    label = shortLabel(piece);
  }
  return {
    custom: piece.unit === "custom",
    label,
    left,
    title: `${piece.unit}: ${piece.start.toString()} → ${piece.end.toString()}`,
    width,
  };
}

/**
 * How a pin's label lines up with the pin, so labels near an edge stay in.
 *
 * @param left - The pin's position, in percent of the axis
 * @returns `start`, `center` or `end`
 */
function pinAlign(left: number): "center" | "end" | "start" {
  if (left < EDGE) {
    return "start";
  }
  if (left > FULL - EDGE) {
    return "end";
  }
  return "center";
}

export { barOf, epochOf, pinAlign, position, spanOf, ticksOf };
export type { Marked };
