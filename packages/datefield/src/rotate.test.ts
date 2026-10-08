import { clampDay, rotateSegment } from "./rotate";
import { deriveFormat, parseSegments } from "./parse";
import { describe, expect, it } from "vitest";
import { segmentsToString } from "./convert";

const DAY = 0;
const LITERAL = 1;
const MONTH = 2;
const YEAR = 4;
const UP = 1;
const DOWN = -1;

const format = deriveFormat("de-CH");
const today = new Date("2026-10-08T00:00:00");

function rotate(
  text: string,
  index: number,
  direction: typeof UP | typeof DOWN
): string {
  return segmentsToString(
    rotateSegment(parseSegments(format, text), index, direction, today)
  );
}

describe("rotateSegment() day", () => {
  it(
    "wraps the day at the end of the month without touching the month",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      expect(rotate("31.03.2026", DAY, UP)).toBe("01.03.2026");
      expect(rotate("01.03.2026", DAY, DOWN)).toBe("31.03.2026");
    }
  );

  it("uses the actual month length", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(rotate("30.04.2026", DAY, UP)).toBe("01.04.2026");
    expect(rotate("28.02.2026", DAY, UP)).toBe("01.02.2026");
    expect(rotate("28.02.2024", DAY, UP)).toBe("29.02.2024");
  });

  it(
    "assumes the widest range while month or year is unknown",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      expect(rotate("30.__.____", DAY, UP)).toBe("31.__.____");
      expect(rotate("28.02.____", DAY, UP)).toBe("29.02.____");
    }
  );
});

describe("rotateSegment() month and year", () => {
  it("wraps the month without touching the year", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(rotate("15.12.2026", MONTH, UP)).toBe("15.01.2026");
    expect(rotate("15.01.2026", MONTH, DOWN)).toBe("15.12.2026");
  });

  it("clamps the day when the month changes", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(rotate("31.01.2026", MONTH, UP)).toBe("28.02.2026");
    expect(rotate("31.03.2026", MONTH, UP)).toBe("30.04.2026");
  });

  it(
    "clamps Feb 29 when the year changes to a non-leap year",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      expect(rotate("29.02.2024", YEAR, UP)).toBe("28.02.2025");
    }
  );

  it("steps the year without wrapping", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(rotate("15.03.2026", YEAR, UP)).toBe("15.03.2027");
    expect(rotate("15.03.2026", YEAR, DOWN)).toBe("15.03.2025");
  });
});

describe("rotateSegment() incomplete input", () => {
  it(
    "starts an empty segment like a native date input",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      expect(rotate("__.__.____", DAY, UP)).toBe("01.__.____");
      expect(rotate("__.__.____", DAY, DOWN)).toBe("31.__.____");
      expect(rotate("__.__.____", MONTH, DOWN)).toBe("__.12.____");
      expect(rotate("__.__.____", YEAR, UP)).toBe("__.__.2026");
    }
  );

  it(
    "leaves other segments untouched while they are incomplete",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      expect(rotate("1_.03.20__", MONTH, UP)).toBe("1_.04.20__");
    }
  );

  it("ignores literal segments", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(rotate("31.03.2026", LITERAL, UP)).toBe("31.03.2026");
  });
});

describe("clampDay()", () => {
  it(
    "clamps a typed day that no longer fits the month",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const segments = parseSegments(format, "31.02.2026");
      expect(segmentsToString(clampDay(segments))).toBe("28.02.2026");
    }
  );

  it("returns the same array when nothing changes", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const segments = parseSegments(format, "15.02.2026");
    expect(clampDay(segments)).toBe(segments);
  });
});
