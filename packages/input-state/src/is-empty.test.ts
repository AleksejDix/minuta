import { createInputState, isEmpty, typeChar } from "./input-state";
import { describe, expect, it } from "vitest";
import { parseMask } from "./mask";

const DATE = parseMask("99.99.9999");

describe("isEmpty()", () => {
  it("is true while no slot is filled", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(isEmpty(createInputState({ mask: DATE }))).toBe(true);
  });

  it("is false once one slot is filled", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const typed = typeChar(createInputState({ mask: DATE }), "3");
    expect(isEmpty(typed)).toBe(false);
  });

  it("checks the text of a field without a mask", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(isEmpty(createInputState())).toBe(true);
    expect(isEmpty(createInputState({ value: "hi" }))).toBe(false);
  });
});
