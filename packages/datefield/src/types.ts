/**
 * Editable segment types: the parts a user can type into.
 * These can be incremented, decremented, and typed into.
 */
type EditableSegmentType =
  | "day"
  | "month"
  | "year"
  | "hour"
  | "minute"
  | "second"
  | "dayPeriod";

/**
 * Derived segment types from Intl.DateTimeFormat.
 * These are display-only — computed from the date, not directly editable.
 */
type DerivedSegmentType =
  | "era"
  | "weekday"
  | "fractionalSecond"
  | "timeZoneName";

/**
 * How a clock counts hours: `h12` 1–12 and `h11` 0–11 with a day period,
 * `h23` 0–23, `h24` 1–24.
 */
type HourCycle = "h11" | "h12" | "h23" | "h24";

/**
 * What an hour or day period segment needs to be read: the clock's hour
 * cycle, and the texts of the day period (AM first, then PM).
 */
type SegmentMeta = Readonly<{
  hourCycle?: HourCycle | undefined;
  options?: readonly string[] | undefined;
}>;

/**
 * All segment types: editable, derived, or literal separators.
 */
type SegmentType = EditableSegmentType | DerivedSegmentType | "literal";

/**
 * A single segment of a formatted date string.
 *
 * @example
 * // The "31" in "31.03.2026"
 * { type: "day", value: "31", start: 0, end: 2 }
 */
type Segment = SegmentMeta & {
  readonly type: SegmentType;
  readonly value: string;
  /** Character index where this segment starts in the full string */
  readonly start: number;
  /** Character index where this segment ends (exclusive) */
  readonly end: number;
};

/**
 * A date format token.
 *
 * @example
 * // DD
 * { type: "day", length: 2 }
 * // .
 * { type: "literal", char: "." }
 */
type FormatToken =
  | (SegmentMeta & {
      readonly type: EditableSegmentType | DerivedSegmentType;
      readonly length: number;
    })
  | { readonly type: "literal"; readonly char: string };

/**
 * Parsed format definition — an ordered list of tokens.
 */
type DateFormat = FormatToken[];

/**
 * The full state of a segmented date input.
 */
type SegmentedDate = {
  segments: Segment[];
  activeIndex: number;
};

export type {
  DateFormat,
  HourCycle,
  SegmentMeta,
  DerivedSegmentType,
  EditableSegmentType,
  FormatToken,
  Segment,
  SegmentedDate,
  SegmentType,
};
