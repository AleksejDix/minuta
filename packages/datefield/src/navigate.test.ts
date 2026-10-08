import { deriveFormat, parseSegments } from "./parse";
import { describe, expect, it } from "vitest";
import {
  firstEditableIndex,
  lastEditableIndex,
  nextSegment,
  previousSegment,
  segmentAtPosition,
} from "./navigate";

const DAY_INDEX = 0;
const MONTH_INDEX = 2;
const YEAR_INDEX = 4;
const DAY_START = 0;
const INSIDE_DAY = 1;
const MONTH_START = 3;
const YEAR_START = 6;
const TEXT_END = 10;

const format = deriveFormat("de-CH");
const segments = parseSegments(format, "31.03.2026");

describe("segmentAtPosition()", () => {
  it("returns day segment for cursor at 0", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(segmentAtPosition(segments, DAY_START)).toBe(DAY_INDEX);
  });

  it("returns day segment for cursor at 1", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(segmentAtPosition(segments, INSIDE_DAY)).toBe(DAY_INDEX);
  });

  it("returns month segment for cursor at 3", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(segmentAtPosition(segments, MONTH_START)).toBe(MONTH_INDEX);
  });

  it("returns year segment for cursor at 6", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(segmentAtPosition(segments, YEAR_START)).toBe(YEAR_INDEX);
  });

  it("returns year segment for cursor at end (10)", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(segmentAtPosition(segments, TEXT_END)).toBe(YEAR_INDEX);
  });
});

describe("nextSegment()", () => {
  it(
    "moves from day (0) to month (2), skipping literal",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      expect(nextSegment(segments, DAY_INDEX)).toBe(MONTH_INDEX);
    }
  );

  it(
    "moves from month (2) to year (4), skipping literal",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      expect(nextSegment(segments, MONTH_INDEX)).toBe(YEAR_INDEX);
    }
  );

  it("stays at year (4) when no next exists", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(nextSegment(segments, YEAR_INDEX)).toBe(YEAR_INDEX);
  });
});

describe("previousSegment()", () => {
  it(
    "moves from year (4) to month (2), skipping literal",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      expect(previousSegment(segments, YEAR_INDEX)).toBe(MONTH_INDEX);
    }
  );

  it(
    "moves from month (2) to day (0), skipping literal",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      expect(previousSegment(segments, MONTH_INDEX)).toBe(DAY_INDEX);
    }
  );

  it("stays at day (0) when no previous exists", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(previousSegment(segments, DAY_INDEX)).toBe(DAY_INDEX);
  });
});

describe("firstEditableIndex()", () => {
  it("returns 0 for DD.MM.YYYY", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(firstEditableIndex(segments)).toBe(DAY_INDEX);
  });
});

describe("lastEditableIndex()", () => {
  it("returns 4 for DD.MM.YYYY", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(lastEditableIndex(segments)).toBe(YEAR_INDEX);
  });
});
