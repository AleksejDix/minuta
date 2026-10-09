import {
  cellOf,
  dayNamed,
  find,
  focused,
  press,
  renderCalendar,
  tabbable,
} from "#src/test/calendar";
import { describe, expect, it } from "vitest";
import type { Period } from "minuta/core";
import { nativeUnits } from "minuta/native";

type KeyCase = Readonly<{
  expected: string;
  heading: string;
  key: string;
  shiftKey: boolean;
}>;

const JANUARY_17 = "Wednesday, January 17, 2024";
const JANUARY_31 = "Wednesday, January 31, 2024";
const ONE = 1;

const KEY_CASES: readonly KeyCase[] = [
  {
    expected: "Thursday, January 18, 2024",
    heading: "January 2024",
    key: "ArrowRight",
    shiftKey: false,
  },
  {
    expected: "Tuesday, January 16, 2024",
    heading: "January 2024",
    key: "ArrowLeft",
    shiftKey: false,
  },
  {
    expected: "Wednesday, January 24, 2024",
    heading: "January 2024",
    key: "ArrowDown",
    shiftKey: false,
  },
  {
    expected: "Wednesday, January 10, 2024",
    heading: "January 2024",
    key: "ArrowUp",
    shiftKey: false,
  },
  {
    expected: "Monday, January 15, 2024",
    heading: "January 2024",
    key: "Home",
    shiftKey: false,
  },
  {
    expected: "Sunday, January 21, 2024",
    heading: "January 2024",
    key: "End",
    shiftKey: false,
  },
  {
    expected: "Saturday, February 17, 2024",
    heading: "February 2024",
    key: "PageDown",
    shiftKey: false,
  },
  {
    expected: "Sunday, December 17, 2023",
    heading: "December 2023",
    key: "PageUp",
    shiftKey: false,
  },
  {
    expected: "Friday, January 17, 2025",
    heading: "January 2025",
    key: "PageDown",
    shiftKey: true,
  },
  {
    expected: "Tuesday, January 17, 2023",
    heading: "January 2023",
    key: "PageUp",
    shiftKey: true,
  },
];

/**
 * The text of the month heading.
 *
 * @param element - The container
 * @returns The heading text
 */
function heading(element: HTMLElement): string {
  return find(element, "h2").textContent.trim();
}

describe("calendar keyboard navigation", () => {
  it.each(KEY_CASES)(
    "moves the focus with $key (shift: $shiftKey)",
    { timeout: 5000 },
    async ({ expected, heading: month, key, shiftKey }) => {
      expect.hasAssertions();
      const element = renderCalendar();
      dayNamed(element, JANUARY_17).focus();

      await expect(press(key, shiftKey)).resolves.toBe(false);

      expect(focused().getAttribute("aria-label")).toBe(expected);
      expect(tabbable(element)).toStrictEqual([focused()]);
      expect(heading(element)).toBe(month);
    }
  );

  it("respects a Sunday week start", { timeout: 5000 }, async () => {
    expect.hasAssertions();
    const element = renderCalendar({
      units: nativeUnits({ weekStartsOn: "sunday" }),
    });
    dayNamed(element, JANUARY_17).focus();

    await press("Home");
    expect(focused().getAttribute("aria-label")).toBe(
      "Sunday, January 14, 2024"
    );
    await press("End");
    expect(focused().getAttribute("aria-label")).toBe(
      "Saturday, January 20, 2024"
    );
  });
});

describe("calendar keyboard navigation across months", () => {
  it("browses when the focus leaves the month", { timeout: 5000 }, async () => {
    expect.hasAssertions();
    const element = renderCalendar();
    dayNamed(element, JANUARY_31).focus();

    await press("ArrowRight");

    expect(focused().getAttribute("aria-label")).toBe(
      "Thursday, February 1, 2024"
    );
    expect(heading(element)).toBe("February 2024");
  });

  it("clamps to the end of a shorter month", { timeout: 5000 }, async () => {
    expect.hasAssertions();
    const element = renderCalendar();
    dayNamed(element, JANUARY_31).focus();

    await press("PageDown");
    expect(focused().getAttribute("aria-label")).toBe(
      "Thursday, February 29, 2024"
    );
    await press("PageDown", true);
    expect(focused().getAttribute("aria-label")).toBe(
      "Friday, February 28, 2025"
    );
  });
});

describe("calendar keyboard selection", () => {
  it.each(["Enter", " "])(
    "selects the focused day with %j",
    { timeout: 5000 },
    async (key) => {
      expect.hasAssertions();
      const selected: Period[] = [];
      const element = renderCalendar({
        onSelect: (day) => {
          selected.push(day);
        },
      });
      dayNamed(element, JANUARY_17).focus();

      await expect(press(key)).resolves.toBe(false);

      expect(selected).toHaveLength(ONE);
      expect(cellOf(focused()).getAttribute("aria-selected")).toBe("true");
    }
  );

  it("does not select while moving the focus", { timeout: 5000 }, async () => {
    expect.hasAssertions();
    const selected: Period[] = [];
    const element = renderCalendar({
      onSelect: (day) => {
        selected.push(day);
      },
    });
    dayNamed(element, JANUARY_17).focus();

    await press("ArrowRight");
    await press("PageDown");

    expect(selected).toStrictEqual([]);
  });

  it("ignores other keys", { timeout: 5000 }, async () => {
    expect.hasAssertions();
    const element = renderCalendar();
    dayNamed(element, JANUARY_17).focus();

    await expect(press("a")).resolves.toBe(true);
    expect(focused().getAttribute("aria-label")).toBe(JANUARY_17);
  });
});
