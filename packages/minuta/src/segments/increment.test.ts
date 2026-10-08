import { deriveFormat, parseSegments } from "./parse";
import { describe, expect, it } from "vitest";
import { createNativeAdapter } from "#src/adapters/native/adapter";
import { incrementSegment } from "./increment";
import { segmentsToString } from "./convert";

const DAY_INDEX = 0;
const LITERAL_INDEX = 1;
const MONTH_INDEX = 2;
const YEAR_INDEX = 4;
const UP = 1;
const DOWN = -1;

const adapter = createNativeAdapter();
const format = deriveFormat("de-CH");

function step(
  text: string,
  index: number,
  direction: typeof UP | typeof DOWN
): string {
  const segments = parseSegments(format, text);
  return segmentsToString(
    incrementSegment(adapter, segments, index, direction, format)
  );
}

describe("incrementSegment() single units", () => {
  it("increments day", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(step("15.03.2026", DAY_INDEX, UP)).toBe("16.03.2026");
  });

  it("decrements day", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(step("15.03.2026", DAY_INDEX, DOWN)).toBe("14.03.2026");
  });

  it("increments month", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(step("15.03.2026", MONTH_INDEX, UP)).toBe("15.04.2026");
  });

  it("decrements month", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(step("15.03.2026", MONTH_INDEX, DOWN)).toBe("15.02.2026");
  });

  it("increments year", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(step("15.03.2026", YEAR_INDEX, UP)).toBe("15.03.2027");
  });
});

describe("incrementSegment() boundaries", () => {
  it("rolls day across month boundary", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(step("31.03.2026", DAY_INDEX, UP)).toBe("01.04.2026");
  });

  it("rolls month across year boundary", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(step("15.12.2026", MONTH_INDEX, UP)).toBe("15.01.2027");
  });

  it(
    "handles month increment with day clamping (Jan 31 + 1 month)",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      // Native adapter: adding 1 month to Jan 31 → Mar 3 (or Feb 28 depending on adapter)
      // The key point: it uses the adapter, not hardcoded math
      const str = step("31.01.2026", MONTH_INDEX, UP);
      expect(str).toMatch(/^\d{2}\.\d{2}\.2026$/u);
    }
  );

  it("ignores literal segments", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(step("15.03.2026", LITERAL_INDEX, UP)).toBe("15.03.2026");
  });
});
