/**
 * Headless logic for segmented date inputs like DD.MM.YYYY (datefield).
 *
 * Locale formats come from Intl.DateTimeFormat and become input-state masks;
 * editing overwrites slots, so correcting one digit never shifts the rest.
 * Framework-agnostic: no DOM, no framework.
 */
// Parse
export {
  deriveFormat,
  parseSegments,
  placeholder,
  formatLength,
} from "./parse";

// Navigate
export {
  segmentAtPosition,
  nextSegment,
  previousSegment,
  firstEditableIndex,
  lastEditableIndex,
} from "./navigate";

// Convert
export { toDate, fromDate, segmentsToString } from "./convert";

// Input
export { inputDigit, clearSegment } from "./input";

// Rotate
export { rotateSegment, clampDay } from "./rotate";

// Typing: digits fill slots, separators finish a segment
export { finishSegment, typeDate } from "./type-date";
export { recognizeDate } from "./recognize";

// Digits of a locale, for display
export { localeDigits } from "./digits";

// Bridge to input-state fields
export { dateMask, withSegments } from "./field";

export type { InputResult } from "./input";

// Types
export type {
  Segment,
  SegmentType,
  EditableSegmentType,
  DerivedSegmentType,
  SegmentedDate,
  DateFormat,
  FormatToken,
} from "./types";
