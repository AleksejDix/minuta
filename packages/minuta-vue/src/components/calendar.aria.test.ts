import {
  dayNamed,
  find,
  focused,
  press,
  renderCalendar,
  tabbable,
} from "#src/test/calendar";
import { describe, expect, it } from "vitest";
import type { Period } from "minuta/core";
import { isWeekendWith } from "minuta/calendar";
import { nativeUnits } from "minuta/native";
import { nextTick } from "vue";

const JANUARY_17 = "Wednesday, January 17, 2024";
const JANUARY_14 = "Sunday, January 14, 2024";
const GRID_ROWS = 7;
const ONE = 1;

/**
 * The one tabbable day.
 *
 * @param element - The container
 * @returns The tabbable day
 */
function onlyTabbable(element: HTMLElement): HTMLElement {
  const days = tabbable(element);
  const [first] = days;
  if (first === undefined || days.length !== ONE) {
    throw new Error(`Expected one tabbable day, got ${String(days.length)}`);
  }
  return first;
}

/**
 * The texts of the selected cells.
 *
 * @param element - The container
 * @returns The trimmed texts
 */
function selectedCells(element: HTMLElement): string[] {
  return [
    ...element.querySelectorAll<HTMLElement>('td[aria-selected="true"]'),
  ].map((cell) => cell.textContent.trim());
}

/**
 * Whether a day falls on a weekend.
 *
 * @param day - The day
 * @returns True on Saturday and Sunday
 */
function isWeekend(day: Period): boolean {
  return isWeekendWith(nativeUnits(), day);
}

describe("calendar grid semantics", () => {
  it("labels the grid with the month heading", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const element = renderCalendar();
    const grid = find(element, '[role="grid"]');
    const label = grid.getAttribute("aria-labelledby");

    expect(find(element, `[id="${String(label)}"]`).textContent.trim()).toBe(
      "January 2024"
    );
    expect(find(element, "h2").getAttribute("aria-live")).toBe("polite");
    expect(grid.querySelectorAll("tr")).toHaveLength(GRID_ROWS);
  });

  it("names the weekday columns in full", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const element = renderCalendar({ locale: "de-CH" });
    const headers = [...element.querySelectorAll<HTMLElement>("th")];

    expect(headers.map((header) => header.getAttribute("abbr"))).toStrictEqual([
      "Montag",
      "Dienstag",
      "Mittwoch",
      "Donnerstag",
      "Freitag",
      "Samstag",
      "Sonntag",
    ]);
    expect(headers.map((header) => header.getAttribute("scope"))).toContain(
      "col"
    );
  });

  it("labels every day with its full date", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const element = renderCalendar();

    expect(dayNamed(element, JANUARY_17).textContent.trim()).toBe("17");
  });
});

describe("calendar header semantics", () => {
  it("names the month buttons", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const element = renderCalendar();

    expect(find(element, '[aria-label="Previous month"]').tagName).toBe(
      "BUTTON"
    );
    expect(find(element, '[aria-label="Next month"]').tagName).toBe("BUTTON");
  });
});

describe("calendar roving tabindex", () => {
  it("starts on the first of the month", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const element = renderCalendar();

    expect(onlyTabbable(element).getAttribute("aria-label")).toBe(
      "Monday, January 1, 2024"
    );
  });

  it("starts on today when it is shown", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const element = renderCalendar({ date: new Date() });

    expect(onlyTabbable(element).getAttribute("aria-current")).toBe("date");
  });

  it("follows the selected day", { timeout: 5000 }, async () => {
    expect.hasAssertions();
    const element = renderCalendar();

    dayNamed(element, JANUARY_17).click();
    await nextTick();

    expect(onlyTabbable(element).getAttribute("aria-label")).toBe(JANUARY_17);
    expect(selectedCells(element)).toStrictEqual(["17"]);
  });
});

describe("calendar disabled days", () => {
  it("marks disabled days", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const element = renderCalendar({ isDisabled: isWeekend });

    expect(dayNamed(element, JANUARY_14).getAttribute("aria-disabled")).toBe(
      "true"
    );
    expect(dayNamed(element, JANUARY_17).getAttribute("aria-disabled")).toBe(
      "false"
    );
  });

  it("does not select a disabled day", { timeout: 5000 }, async () => {
    expect.hasAssertions();
    const selected: Period[] = [];
    const element = renderCalendar({
      isDisabled: isWeekend,
      onSelect: (day) => {
        selected.push(day);
      },
    });
    const sunday = dayNamed(element, JANUARY_14);

    sunday.click();
    sunday.focus();
    await press("Enter");

    expect(focused()).toBe(sunday);
    expect(selected).toStrictEqual([]);
    expect(selectedCells(element)).toStrictEqual([]);
  });
});
