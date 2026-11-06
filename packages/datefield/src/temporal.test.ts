import { deriveFormat, parseSegments } from "./parse";
import { describe, expect, it } from "vitest";
import {
  fromTemporal,
  toPlainDate,
  toPlainDateTime,
  toPlainTime,
} from "./temporal";
import type { Segment } from "./types";
import { Temporal } from "temporal-polyfill/full";
import { segmentsToString } from "./convert";

const date = deriveFormat("de-CH");
const time = deriveFormat("en-GB", { hour: "2-digit", minute: "2-digit" });
const twelve = deriveFormat("en-US", {
  hour: "numeric",
  hour12: true,
  minute: "2-digit",
});

/**
 * A value as ISO, "" for none.
 *
 * @param value - A Temporal value or nothing
 * @returns Its ISO text
 */
function iso(value: Readonly<{ toString: () => string }> | undefined): string {
  if (value === undefined) {
    return "";
  }
  return value.toString();
}

/**
 * The day period the segments show, "" for none.
 *
 * @param segments - A field's segments
 * @returns The day period's text
 */
function periodOf(segments: readonly Readonly<Segment>[]): string {
  const part = segments.find((seg) => seg.type === "dayPeriod");
  if (part === undefined) {
    return "";
  }
  return part.value;
}

describe("toPlainDate()", () => {
  it("reads a day from a date field", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const segments = parseSegments(date, "31.03.2026");
    expect(iso(toPlainDate(segments))).toBe("2026-03-31");
  });

  it("reads no day from 30 February", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(toPlainDate(parseSegments(date, "30.02.2026"))).toBeUndefined();
  });

  it("reads no day from an empty field", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(toPlainDate(parseSegments(date, "__.__.____"))).toBeUndefined();
  });
});

describe("toPlainTime()", () => {
  it("reads a wall-clock time from a time field", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const segments = parseSegments(time, "14:05");
    expect(iso(toPlainTime(segments))).toBe("14:05:00");
  });

  it("reads no time from a 25th hour", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(toPlainTime(parseSegments(time, "25:00"))).toBeUndefined();
  });
});

describe("toPlainDateTime()", () => {
  it("reads a date field's day at midnight", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const segments = parseSegments(date, "31.03.2026");
    expect(iso(toPlainDateTime(segments))).toBe("2026-03-31T00:00:00");
  });
});

describe("fromTemporal()", () => {
  it("shows a day, and reads it back", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const day = Temporal.PlainDate.from("2026-03-31");
    const segments = fromTemporal(day, date, "de-CH");
    expect(segmentsToString(segments)).toBe("31.03.2026");
    expect(iso(toPlainDate(segments))).toBe("2026-03-31");
  });

  it("shows a time in a time field", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const at = Temporal.PlainTime.from("09:30");
    expect(segmentsToString(fromTemporal(at, time, "en-GB"))).toBe("09:30");
  });

  it(
    "names a derived part from the wall clock, in no zone",
    {
      timeout: 5000,
    },
    () => {
      expect.hasAssertions();
      const at = Temporal.PlainTime.from("23:30");
      const shown = periodOf(fromTemporal(at, twelve, "en-US"));
      expect(shown).toBe("at night");
    }
  );
});
