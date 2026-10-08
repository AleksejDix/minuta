import { describe, expect, it } from "vitest";
import { fromSlots, toSlots } from "./slots";
import { deriveFormat } from "./parse";
import { segmentsToString } from "./convert";

const format = deriveFormat("de-CH");

describe("fromSlots()", () => {
  it("maps a full GapBuffer value onto the format", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(segmentsToString(fromSlots(format, "31032026"))).toBe("31.03.2026");
  });

  it(
    "turns gaps and missing trailing slots into placeholders",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      expect(segmentsToString(fromSlots(format, "3 03"))).toBe("3_.03.____");
    }
  );

  it("follows the locale order", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const us = deriveFormat("en-US");
    expect(segmentsToString(fromSlots(us, "03312026"))).toBe("03/31/2026");
  });
});

describe("toSlots()", () => {
  it(
    "drops separators and maps placeholders back to gaps",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      expect(toSlots(fromSlots(format, "3 03"))).toBe("3 03");
    }
  );

  it("round-trips a full value", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(toSlots(fromSlots(format, "31032026"))).toBe("31032026");
  });
});
