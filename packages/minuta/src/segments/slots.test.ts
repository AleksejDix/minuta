import { describe, it, expect } from "vitest";
import { deriveFormat } from "./parse";
import { fromSlots, toSlots } from "./slots";
import { segmentsToString } from "./convert";

const format = deriveFormat("de-CH");

describe("fromSlots", () => {
  it("maps a full GapBuffer value onto the format", () => {
    expect(segmentsToString(fromSlots(format, "31032026"))).toBe("31.03.2026");
  });

  it("turns gaps and missing trailing slots into placeholders", () => {
    expect(segmentsToString(fromSlots(format, "3 03"))).toBe("3_.03.____");
  });

  it("follows the locale order", () => {
    const us = deriveFormat("en-US");
    expect(segmentsToString(fromSlots(us, "03312026"))).toBe("03/31/2026");
  });
});

describe("toSlots", () => {
  it("drops separators and maps placeholders back to gaps", () => {
    expect(toSlots(fromSlots(format, "3 03"))).toBe("3 03");
  });

  it("round-trips a full value", () => {
    expect(toSlots(fromSlots(format, "31032026"))).toBe("31032026");
  });
});
