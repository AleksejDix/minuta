/**
 * Segmented date input — pure logic for gap-based date editing.
 *
 * Import from 'minuta/segments'
 *
 * Provides parsing, navigation, increment/decrement, and digit input
 * for segmented date fields (e.g. DD.MM.YYYY). Framework-agnostic —
 * wire these pure functions to DOM events in your framework of choice.
 */
export {
  deriveFormat,
  parseSegments,
  placeholder,
  formatLength,
  segmentAtPosition,
  nextSegment,
  previousSegment,
  firstEditableIndex,
  lastEditableIndex,
  toDate,
  fromDate,
  segmentsToString,
  incrementSegment,
  inputDigit,
  clearSegment,
  rotateSegment,
  clampDay,
  fromSlots,
  toSlots,
  GapBuffer,
  GAP,
  REGEXP_ONLY_DIGITS,
  formatPeriod,
  formatRange,
  formatPeriodWith,
} from "./segments/index";

export type {
  Segment,
  SegmentType,
  SegmentedDate,
  DateFormat,
  FormatToken,
  Slot,
  GapBufferOptions,
} from "./segments/index";
