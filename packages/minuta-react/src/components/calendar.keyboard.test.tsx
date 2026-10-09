import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { CalendarGrid } from "./CalendarGrid";
import { CalendarHeader } from "./CalendarHeader";
import { CalendarRoot } from "./CalendarRoot";
import type { Period } from "minuta/core";
import type { RenderResult } from "@testing-library/react";
import { nativeUnits } from "minuta/native";

type OnSelect = (day: Period) => void;

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

function renderCalendar(
  units = nativeUnits(),
  onSelect?: OnSelect
): RenderResult {
  return render(
    <CalendarRoot
      date={new Date("2024-01-15T00:00:00")}
      onSelect={onSelect}
      units={units}
    >
      <CalendarHeader />
      <CalendarGrid />
    </CalendarRoot>
  );
}

function focusDay(label: string): void {
  screen.getByRole("button", { name: label }).focus();
}

function focused(): HTMLElement {
  const element = document.activeElement;
  if (!(element instanceof HTMLElement)) {
    throw new TypeError("Expected a focused element");
  }
  return element;
}

function cellOf(day: HTMLElement): HTMLElement {
  const cell = day.closest("td");
  if (cell === null) {
    throw new Error("Expected the day inside a grid cell");
  }
  return cell;
}

function press(key: string, shiftKey = false): boolean {
  return fireEvent.keyDown(focused(), { key, shiftKey });
}

function tabbable(container: HTMLElement): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>('[tabindex="0"]')];
}

describe("calendar keyboard navigation", () => {
  afterEach(cleanup);

  it.each(KEY_CASES)(
    "should move the focus with $key (shift: $shiftKey)",
    { timeout: 5000 },
    ({ expected, heading, key, shiftKey }) => {
      expect.hasAssertions();
      const { container } = renderCalendar();
      focusDay(JANUARY_17);

      expect(press(key, shiftKey)).toBe(false);

      expect(focused().getAttribute("aria-label")).toBe(expected);
      expect(tabbable(container)).toStrictEqual([focused()]);
      expect(screen.getByRole("heading").textContent).toBe(heading);
    }
  );

  it("should respect a Sunday week start", { timeout: 5000 }, () => {
    expect.hasAssertions();
    renderCalendar(nativeUnits({ weekStartsOn: "sunday" }));
    focusDay(JANUARY_17);

    press("Home");
    expect(focused().getAttribute("aria-label")).toBe(
      "Sunday, January 14, 2024"
    );
    press("End");
    expect(focused().getAttribute("aria-label")).toBe(
      "Saturday, January 20, 2024"
    );
  });
});

describe("calendar keyboard navigation across months", () => {
  afterEach(cleanup);

  it("should browse when the focus leaves the month", { timeout: 5000 }, () => {
    expect.hasAssertions();
    renderCalendar();
    focusDay(JANUARY_31);

    press("ArrowRight");

    expect(focused().getAttribute("aria-label")).toBe(
      "Thursday, February 1, 2024"
    );
    expect(screen.getByRole("heading").textContent).toBe("February 2024");
  });

  it("should clamp to the end of a shorter month", { timeout: 5000 }, () => {
    expect.hasAssertions();
    renderCalendar();
    focusDay(JANUARY_31);

    press("PageDown");
    expect(focused().getAttribute("aria-label")).toBe(
      "Thursday, February 29, 2024"
    );
    press("PageDown", true);
    expect(focused().getAttribute("aria-label")).toBe(
      "Friday, February 28, 2025"
    );
  });
});

describe("calendar keyboard selection", () => {
  afterEach(cleanup);

  it.each(["Enter", " "])(
    "should select the focused day with %j",
    { timeout: 5000 },
    (key) => {
      expect.hasAssertions();
      const onSelect = vi.fn<OnSelect>();
      renderCalendar(nativeUnits(), onSelect);
      focusDay(JANUARY_17);

      expect(press(key)).toBe(false);

      expect(onSelect).toHaveBeenCalledTimes(ONE);
      expect(cellOf(focused()).getAttribute("aria-selected")).toBe("true");
    }
  );

  it("should not select while moving the focus", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const onSelect = vi.fn<OnSelect>();
    renderCalendar(nativeUnits(), onSelect);
    focusDay(JANUARY_17);

    press("ArrowRight");
    press("PageDown");

    expect(onSelect).not.toHaveBeenCalled();
  });

  it("should ignore other keys", { timeout: 5000 }, () => {
    expect.hasAssertions();
    renderCalendar();
    focusDay(JANUARY_17);

    expect(press("a")).toBe(true);
    expect(focused().getAttribute("aria-label")).toBe(JANUARY_17);
  });
});
