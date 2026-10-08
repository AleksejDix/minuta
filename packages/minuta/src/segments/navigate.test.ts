import { describe, it, expect } from "vitest";
import { deriveFormat, parseSegments } from "./parse";
import {
  segmentAtPosition,
  nextSegment,
  previousSegment,
  firstEditableIndex,
  lastEditableIndex,
} from "./navigate";

const format = deriveFormat("de-CH");
const segments = parseSegments(format, "31.03.2026");

describe("segmentAtPosition", () => {
  it("returns day segment for cursor at 0", () => {
    expect(segmentAtPosition(segments, 0)).toBe(0);
  });

  it("returns day segment for cursor at 1", () => {
    expect(segmentAtPosition(segments, 1)).toBe(0);
  });

  it("returns month segment for cursor at 3", () => {
    expect(segmentAtPosition(segments, 3)).toBe(2);
  });

  it("returns year segment for cursor at 6", () => {
    expect(segmentAtPosition(segments, 6)).toBe(4);
  });

  it("returns year segment for cursor at end (10)", () => {
    expect(segmentAtPosition(segments, 10)).toBe(4);
  });
});

describe("nextSegment", () => {
  it("moves from day (0) to month (2), skipping literal", () => {
    expect(nextSegment(segments, 0)).toBe(2);
  });

  it("moves from month (2) to year (4), skipping literal", () => {
    expect(nextSegment(segments, 2)).toBe(4);
  });

  it("stays at year (4) when no next exists", () => {
    expect(nextSegment(segments, 4)).toBe(4);
  });
});

describe("previousSegment", () => {
  it("moves from year (4) to month (2), skipping literal", () => {
    expect(previousSegment(segments, 4)).toBe(2);
  });

  it("moves from month (2) to day (0), skipping literal", () => {
    expect(previousSegment(segments, 2)).toBe(0);
  });

  it("stays at day (0) when no previous exists", () => {
    expect(previousSegment(segments, 0)).toBe(0);
  });
});

describe("firstEditableIndex", () => {
  it("returns 0 for DD.MM.YYYY", () => {
    expect(firstEditableIndex(segments)).toBe(0);
  });
});

describe("lastEditableIndex", () => {
  it("returns 4 for DD.MM.YYYY", () => {
    expect(lastEditableIndex(segments)).toBe(4);
  });
});
