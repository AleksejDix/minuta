import type { Adapter } from "../types";
import type { DateFormat, EditableSegmentType, Segment } from "./types";

const EDITABLE_TYPES = new Set<string>([
  "day",
  "month",
  "year",
  "hour",
  "minute",
  "second",
]);

const DERIVED_TYPES = new Set<string>([
  "era",
  "weekday",
  "dayPeriod",
  "fractionalSecond",
  "timeZoneName",
]);

/**
 * Convert segments to a Date using the adapter.
 * Returns undefined if the segments don't form a valid date.
 *
 * Editable segments (day, month, year, hour, minute, second) are parsed.
 * Derived segments (era, weekday, dayPeriod, etc.) are ignored — they're computed from the date.
 */
export function toDate(
  _adapter: Adapter,
  segments: Segment[]
): Date | undefined {
  const parts: Record<string, number> = {};

  for (const seg of segments) {
    if (seg.type === "literal" || DERIVED_TYPES.has(seg.type)) continue;
    if (!/^\d+$/.test(seg.value)) return undefined;
    const n = parseInt(seg.value, 10);
    parts[seg.type] = n;
  }

  if (
    parts.day === undefined ||
    parts.month === undefined ||
    parts.year === undefined
  ) {
    return undefined;
  }

  const candidate = new Date(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour ?? 0,
    parts.minute ?? 0,
    parts.second ?? 0
  );

  // Validate: if the date rolled over (e.g. Feb 30 → Mar 2), it's invalid
  if (
    candidate.getFullYear() !== parts.year ||
    candidate.getMonth() !== parts.month - 1 ||
    candidate.getDate() !== parts.day
  ) {
    return undefined;
  }

  // Validate time parts if present
  if (
    (parts.hour !== undefined && candidate.getHours() !== parts.hour) ||
    (parts.minute !== undefined && candidate.getMinutes() !== parts.minute) ||
    (parts.second !== undefined && candidate.getSeconds() !== parts.second)
  ) {
    return undefined;
  }

  return candidate;
}

/**
 * Convert a Date to segments matching a format.
 *
 * Handles editable segments (day, month, year, hour, minute, second)
 * and derived segments (era, weekday, dayPeriod, fractionalSecond, timeZoneName).
 */
export function fromDate(
  _adapter: Adapter,
  date: Date,
  format: DateFormat,
  locale?: string
): Segment[] {
  let pos = 0;
  const segments: Segment[] = [];

  for (const token of format) {
    if (token.type === "literal") {
      segments.push({
        type: "literal",
        value: token.char,
        start: pos,
        end: pos + token.char.length,
      });
      pos += token.char.length;
    } else if (EDITABLE_TYPES.has(token.type)) {
      const value = extractEditablePart(
        date,
        token.type as EditableSegmentType,
        token.length
      );
      segments.push({
        type: token.type,
        value,
        start: pos,
        end: pos + token.length,
      });
      pos += token.length;
    } else if (DERIVED_TYPES.has(token.type)) {
      const value = extractDerivedPart(date, token.type, token.length, locale);
      segments.push({
        type: token.type,
        value,
        start: pos,
        end: pos + value.length,
      });
      pos += value.length;
    }
  }

  return segments;
}

function extractEditablePart(
  date: Date,
  type: EditableSegmentType,
  length: number
): string {
  switch (type) {
    case "day":
      return String(date.getDate()).padStart(length, "0");
    case "month":
      return String(date.getMonth() + 1).padStart(length, "0");
    case "year":
      return String(date.getFullYear()).padStart(length, "0");
    case "hour":
      return String(date.getHours()).padStart(length, "0");
    case "minute":
      return String(date.getMinutes()).padStart(length, "0");
    case "second":
      return String(date.getSeconds()).padStart(length, "0");
  }
}

function extractDerivedPart(
  date: Date,
  type: string,
  length: number,
  locale?: string
): string {
  const loc = locale ?? "en-US";
  const optionMap: Record<string, Intl.DateTimeFormatOptions> = {
    era: { era: length <= 2 ? "narrow" : length <= 3 ? "short" : "long" },
    weekday: {
      weekday: length <= 2 ? "narrow" : length <= 3 ? "short" : "long",
    },
    dayPeriod: {
      hour: "numeric",
      hour12: true,
      dayPeriod: length <= 2 ? "narrow" : length <= 4 ? "short" : "long",
    },
    fractionalSecond: { fractionalSecondDigits: length as 1 | 2 | 3 },
    timeZoneName: {
      timeZoneName: length <= 4 ? "short" : "long",
    },
  };

  const opts = optionMap[type];
  if (!opts) return "";

  const fmt = new Intl.DateTimeFormat(loc, opts);
  const parts = fmt.formatToParts(date);
  const part = parts.find((p) => p.type === type);
  return part?.value ?? "";
}

/**
 * Concatenate segment values into a display string.
 */
export function segmentsToString(segments: Segment[]): string {
  return segments.map((s) => s.value).join("");
}
