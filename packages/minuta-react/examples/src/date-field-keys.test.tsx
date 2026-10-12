import { afterEach, describe, expect, it } from "vitest";
import {
  localDay,
  pressKey,
  renderField,
  select,
  typeText,
} from "./date-field-test-utils";
import { cleanup } from "@testing-library/react";

const DAY_INSIDE = 1;
const MONTH_INSIDE = 4;

describe("<DateFieldRoot> arrow keys", () => {
  afterEach(cleanup);

  it.each([
    ["ArrowUp", "29.10.2026"],
    ["ArrowDown", "27.10.2026"],
  ])("%s steps the day", { timeout: 5000 }, (key, expected) => {
    expect.hasAssertions();
    const { input } = renderField("de-CH");
    typeText(input, "28102026");
    select(input, DAY_INSIDE);
    pressKey(input, key);
    expect(input.value).toBe(expected);
  });

  it("wraps the last day of a month to the first", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { input } = renderField("de-CH");
    typeText(input, "31102026");
    select(input, DAY_INSIDE);
    pressKey(input, "ArrowUp");
    expect(input.value).toBe("01.10.2026");
  });

  it("clamps the day when the month gets shorter", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { input } = renderField("de-CH");
    typeText(input, "31012026");
    select(input, MONTH_INSIDE);
    pressKey(input, "ArrowUp");
    expect(input.value).toBe("28.02.2026");
  });

  it("starts an empty segment at its first value", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { input } = renderField("de-CH");
    select(input, DAY_INSIDE);
    pressKey(input, "ArrowUp");
    expect(input.value).toBe("01.__.____");
  });
});

describe("<DateFieldRoot> value", () => {
  afterEach(cleanup);

  it("shows the initial date", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { input } = renderField("de-CH", localDay("2026-10-28"));
    expect(input.value).toBe("28.10.2026");
  });

  it("starts empty without a date", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { input } = renderField("de-CH");
    expect(input.value).toBe("__.__.____");
  });
});
