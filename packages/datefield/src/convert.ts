import type {
  DateFormat,
  EditableSegmentType,
  FormatToken,
  Segment,
} from "./types";
import { fullYear, shownYear } from "./year";
import { extractDerivedPart } from "./derived-part";

const ZERO_PAD = "0";
const DIGITS = /^\d+$/u;

type DateParts = Partial<Record<EditableSegmentType, number>>;

const EDITABLE_TYPES: ReadonlySet<string> = new Set<EditableSegmentType>([
  "day",
  "hour",
  "minute",
  "month",
  "second",
  "year",
]);

const DERIVED_TYPES: ReadonlySet<string> = new Set<string>([
  "era",
  "weekday",
  "dayPeriod",
  "fractionalSecond",
  "timeZoneName",
]);

function isEditableType(type: string): type is EditableSegmentType {
  return EDITABLE_TYPES.has(type);
}

// The value of a segment; a two-digit year stands for a full year
function partValue(seg: Segment): number {
  const value = Number(seg.value);
  if (seg.type === "year") {
    return fullYear(value, seg.end - seg.start);
  }
  return value;
}

/**
 * Collect the numeric value of every editable segment.
 *
 * @param segments - Segments to read
 * @returns The parts, or undefined if an editable segment is not all digits
 */
function collectParts(segments: readonly Segment[]): DateParts | undefined {
  const parts: DateParts = {};
  for (const seg of segments) {
    if (isEditableType(seg.type)) {
      if (!DIGITS.test(seg.value)) {
        return undefined;
      }
      parts[seg.type] = partValue(seg);
    }
  }
  return parts;
}

/**
 * What a field shows a value from: its editable parts, and the moment Intl
 * names its derived parts (a weekday, a day period) by, epoch milliseconds
 * read in `timeZone`.
 */
type Wall = {
  readonly at: number;
  readonly parts: Readonly<Record<EditableSegmentType, number>>;
  readonly timeZone: string;
};

// A part of the wall clock as a segment of `length` slots shows it
function editableValue(
  type: EditableSegmentType,
  length: number,
  wall: Readonly<Wall>
): string {
  const part = wall.parts[type];
  if (type === "year") {
    return String(shownYear(part, length)).padStart(length, ZERO_PAD);
  }
  return String(part).padStart(length, ZERO_PAD);
}

type TokenInput = {
  readonly locale: string | undefined;
  readonly pos: number;
  readonly token: Readonly<FormatToken>;
  readonly wall: Readonly<Wall>;
};

function tokenToSegment(input: TokenInput): Segment | undefined {
  const { locale, pos, token, wall } = input;
  if (token.type === "literal") {
    return {
      end: pos + token.char.length,
      start: pos,
      type: "literal",
      value: token.char,
    };
  }
  if (isEditableType(token.type)) {
    const value = editableValue(token.type, token.length, wall);
    return { end: pos + token.length, start: pos, type: token.type, value };
  }
  if (DERIVED_TYPES.has(token.type)) {
    const value = extractDerivedPart({
      at: wall.at,
      length: token.length,
      locale,
      timeZone: wall.timeZone,
      type: token.type,
    });
    return { end: pos + value.length, start: pos, type: token.type, value };
  }
  return undefined;
}

/**
 * The segments a wall clock shows in a format.
 *
 * @param wall - The value's parts and the moment its derived parts are named by
 * @param format - Format of the segments
 * @param locale - Locale for derived segments (defaults to en-US)
 * @returns The segments
 */
function segmentsOf(
  wall: Readonly<Wall>,
  format: Readonly<DateFormat>,
  locale?: string
): Segment[] {
  let pos = 0;
  const segments: Segment[] = [];

  for (const token of format) {
    const segment = tokenToSegment({ locale, pos, token, wall });
    if (segment !== undefined) {
      segments.push(segment);
      pos = segment.end;
    }
  }

  return segments;
}

/**
 * Concatenate segment values into a display string.
 *
 * @param segments - Segments to join
 * @returns The display string
 */
function segmentsToString(segments: readonly Segment[]): string {
  return segments.map((seg) => seg.value).join("");
}

export { collectParts, segmentsOf, segmentsToString };
export type { DateParts, Wall };
