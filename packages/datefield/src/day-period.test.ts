import { createInputState, setSelection } from "input-state";
import { deriveFormat, parseSegments, placeholder } from "./parse";
import { describe, expect, it } from "vitest";
import { fromDate, segmentsToString, toDate } from "./convert";
import type { DateFormat } from "./types";
import type { InputState } from "input-state";
import { dateMask } from "./field";
import { rotateSegment } from "./rotate";
import { typeDate } from "./type-date";

const US = deriveFormat("en-US", {
  day: "2-digit",
  hour: "numeric",
  minute: "2-digit",
  month: "2-digit",
  year: "numeric",
});
const JA = deriveFormat("ja-JP", {
  day: "2-digit",
  hour: "numeric",
  hour12: true,
  minute: "2-digit",
  month: "2-digit",
  year: "numeric",
});
const DE = deriveFormat("de-CH", {
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  month: "2-digit",
  year: "numeric",
});
// The en-US format puts a narrow no-break space before the day period
const GAP = "\u202F";
const UP = 1;
const DOWN = -1;

function typed(format: Readonly<DateFormat>, keys: string): InputState {
  let state = createInputState({ mask: dateMask(format) });
  for (const key of keys) {
    state = typeDate(format, state, key);
  }
  return state;
}

function dateIn(format: Readonly<DateFormat>, text: string): Date | undefined {
  return toDate(parseSegments(format, text));
}

describe("a 12-hour format", () => {
  it("has a field with a day period", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(placeholder(US)).toBe(`__/__/____, __:__${GAP}__`);
    expect(() => dateMask(US)).not.toThrow();
  });

  it("types the day period with a letter", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const field = typed(US, "1113202610:30p");
    expect(field.buffer.text).toBe(`11/13/2026, 10:30${GAP}PM`);
  });

  it("finishes the minute when a letter is typed", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(typed(US, "11132026103a").buffer.text).toBe(
      `11/13/2026, 10:03${GAP}AM`
    );
  });

  it("keeps letters out of a 24-hour field", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(typed(DE, "1311202610p").buffer.text).toBe("13.11.2026, 10:__");
  });
});

describe("toDate() with a day period", () => {
  it("reads the hour on a 24-hour clock", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(dateIn(US, `11/13/2026, 10:30${GAP}PM`)).toStrictEqual(
      new Date("2026-11-13T22:30")
    );
    expect(dateIn(US, `11/13/2026, 12:15${GAP}AM`)).toStrictEqual(
      new Date("2026-11-13T00:15")
    );
    expect(dateIn(US, `11/13/2026, 12:15${GAP}PM`)).toStrictEqual(
      new Date("2026-11-13T12:15")
    );
  });

  it("rejects hours outside the cycle", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(dateIn(US, `11/13/2026, 13:30${GAP}PM`)).toBeUndefined();
    expect(dateIn(US, `11/13/2026, 00:30${GAP}AM`)).toBeUndefined();
  });

  it("waits for the day period", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(dateIn(US, `11/13/2026, 10:30${GAP}__`)).toBeUndefined();
  });

  it("reads 0–11 hours and a leading period (ja)", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(dateIn(JA, "2026/11/13 午後00:30")).toStrictEqual(
      new Date("2026-11-13T12:30")
    );
    expect(dateIn(JA, "2026/11/13 午前11:30")).toStrictEqual(
      new Date("2026-11-13T11:30")
    );
  });
});

describe("fromDate() with a day period", () => {
  it("writes the hour and period", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const late = fromDate(new Date("2026-11-13T22:30"), US, "en-US");
    const midnight = fromDate(new Date("2026-11-13T00:15"), US, "en-US");
    const noonJa = fromDate(new Date("2026-11-13T12:30"), JA, "ja-JP");
    expect(segmentsToString(late)).toBe(`11/13/2026, 10:30${GAP}PM`);
    expect(segmentsToString(midnight)).toBe(`11/13/2026, 12:15${GAP}AM`);
    expect(segmentsToString(noonJa)).toBe("2026/11/13 午後00:30");
  });
});

describe("rotateSegment() with a day period", () => {
  it("wraps the hour within 1–12", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const segments = parseSegments(US, `11/13/2026, 12:30${GAP}PM`);
    const hour = segments.findIndex((seg) => seg.type === "hour");
    const up = rotateSegment(segments, hour, UP);
    const down = rotateSegment(
      parseSegments(US, `11/13/2026, 01:30${GAP}PM`),
      hour,
      DOWN
    );
    expect(segmentsToString(up)).toBe(`11/13/2026, 01:30${GAP}PM`);
    expect(segmentsToString(down)).toBe(`11/13/2026, 12:30${GAP}PM`);
  });

  it("switches the day period", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const segments = parseSegments(US, `11/13/2026, 10:30${GAP}PM`);
    const period = segments.findIndex((seg) => seg.type === "dayPeriod");
    expect(segmentsToString(rotateSegment(segments, period, UP))).toBe(
      `11/13/2026, 10:30${GAP}AM`
    );
    const empty = parseSegments(US, `11/13/2026, 10:30${GAP}__`);
    expect(segmentsToString(rotateSegment(empty, period, UP))).toBe(
      `11/13/2026, 10:30${GAP}AM`
    );
  });

  it("leaves a 24-hour clock alone", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const segments = parseSegments(DE, "13.11.2026, 23:30");
    const hour = segments.findIndex((seg) => seg.type === "hour");
    expect(segmentsToString(rotateSegment(segments, hour, UP))).toBe(
      "13.11.2026, 00:30"
    );
  });
});

describe("a selection on the day period", () => {
  it("is overwritten by a letter", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const field = typed(US, "1113202610:30p");
    const atPeriod = setSelection(field, field.buffer.text.indexOf("PM"));
    expect(typeDate(US, atPeriod, "a").buffer.text).toBe(
      `11/13/2026, 10:30${GAP}AM`
    );
  });
});
