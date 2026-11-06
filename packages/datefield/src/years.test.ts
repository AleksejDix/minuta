import { deriveFormat, parseSegments } from "./parse";
import { describe, expect, it } from "vitest";
import { fromTemporal, toPlainDate } from "./temporal";
import type { Segment } from "./types";
import { Temporal } from "temporal-polyfill/full";
import { rotateSegment } from "./rotate";
import { segmentsToString } from "./convert";

const DE = deriveFormat("de-CH");
const DE_SHORT = deriveFormat("de-CH", {
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
});
const TODAY = Temporal.PlainDate.from("2026-10-09");
const YEAR_SEGMENT = 4;
const UP = 1;

// The day the segments make, as Temporal writes it
function dayOf(segments: readonly Segment[]): string {
  return String(toPlainDate(segments));
}

describe("two-digit years", () => {
  it.each([
    ["31.03.26", "2026-03-31"],
    ["31.03.99", "1999-03-31"],
    ["31.03.45", "2045-03-31"],
  ])("reads %s as %s", { timeout: 5000 }, (text, iso) => {
    expect.hasAssertions();
    expect(dayOf(parseSegments(DE_SHORT, text))).toBe(iso);
  });

  it("writes the last two digits of a date's year", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const segments = fromTemporal(
      Temporal.PlainDate.from("2026-03-31"),
      DE_SHORT
    );
    expect(segmentsToString(segments)).toBe("31.03.26");
  });

  it("rotates an empty year to two digits", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const segments = parseSegments(DE_SHORT, "__.__.__");
    const rotated = rotateSegment(segments, YEAR_SEGMENT, UP, TODAY);
    expect(segmentsToString(rotated)).toBe("__.__.26");
  });
});

describe("years below 100", () => {
  it("reads 0050 as the year 50", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(dayOf(parseSegments(DE, "01.01.0050"))).toBe("0050-01-01");
  });

  it("knows 29 February of the year 4", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(dayOf(parseSegments(DE, "29.02.0004"))).toBe("0004-02-29");
  });
});
