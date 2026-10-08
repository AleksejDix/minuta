import { accepts, emptyText, parseMask, slotPositions } from "./mask";
import { describe, expect, it } from "vitest";

const FIRST = 0;
const SECOND = 1;
const FOURTH = 3;
const FIFTH = 4;
const TIME_SLOTS = [FIRST, SECOND, FOURTH, FIFTH];

describe("parseMask()", () => {
  it(
    "maps 9, A and * to slots and everything else to literals",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      expect(parseMask("9A*-").tokens).toStrictEqual([
        { accepts: "digit", kind: "slot" },
        { accepts: "letter", kind: "slot" },
        { accepts: "alphanumeric", kind: "slot" },
        { char: "-", kind: "literal" },
      ]);
    }
  );

  it("treats a backslash-escaped token as a literal", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(parseMask(String.raw`\99`).tokens).toStrictEqual([
      { char: "9", kind: "literal" },
      { accepts: "digit", kind: "slot" },
    ]);
  });

  it("uses _ as the default placeholder", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(parseMask("99").placeholder).toBe("_");
    expect(parseMask("99", "·").placeholder).toBe("·");
  });
});

describe("emptyText()", () => {
  it(
    "renders slots as placeholders and keeps literals",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      expect(emptyText(parseMask("99.99.9999"))).toBe("__.__.____");
    }
  );
});

describe("slotPositions()", () => {
  it("lists the text positions of all slots", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(slotPositions(parseMask("99:99"))).toStrictEqual(TIME_SLOTS);
  });
});

describe("accepts()", () => {
  it("checks a character against a character class", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect([accepts("digit", "7"), accepts("digit", "a")]).toStrictEqual([
      true,
      false,
    ]);
    expect([accepts("letter", "ä"), accepts("letter", "1")]).toStrictEqual([
      true,
      false,
    ]);
    expect([
      accepts("alphanumeric", "Z"),
      accepts("alphanumeric", "-"),
    ]).toStrictEqual([true, false]);
  });

  it(
    "rejects anything that is not exactly one character",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      expect([accepts("digit", ""), accepts("digit", "12")]).toStrictEqual([
        false,
        false,
      ]);
    }
  );
});
