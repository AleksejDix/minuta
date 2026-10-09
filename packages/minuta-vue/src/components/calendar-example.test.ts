import { describe, expect, it } from "vitest";
import { h, nextTick } from "vue";
import { itemAt, mountRender } from "#src/test/mount";
import { CalendarExample } from "#src/components/index";
import type { Period } from "minuta/core";

const DAYS_IN_GRID = 42;
const FIRST = 0;
const ONE_DAY = 1;

/**
 * Finds the button with the given text.
 *
 * @param element - The container
 * @param text - The button text
 * @returns The button
 */
function buttonWithText(element: HTMLElement, text: string): HTMLElement {
  const buttons = [...element.querySelectorAll<HTMLElement>("button")];
  const button = buttons.find(
    (candidate) => candidate.textContent.trim() === text
  );
  if (button === undefined) {
    throw new Error(`Missing button ${text}`);
  }
  return button;
}

/**
 * Reads the first weekday label.
 *
 * @param element - The container
 * @returns The label of the first column
 */
function firstWeekday(element: HTMLElement): string {
  const labels = element.querySelectorAll<HTMLElement>(
    '[data-testid="calendar-weekdays"] th'
  );
  return itemAt([...labels], FIRST).textContent.trim();
}

describe("calendarExample", () => {
  it("composes the calendar parts", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { element } = mountRender(() => h(CalendarExample));

    expect(
      element.querySelector('[data-testid="calendar-label"]')
    ).not.toBeNull();
    expect(element.querySelectorAll(".calendar-day")).toHaveLength(
      DAYS_IN_GRID
    );
    expect(firstWeekday(element)).toBe("Mon");
  });

  it(
    "rebuilds the units when the week start changes",
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();
      const { element } = mountRender(() => h(CalendarExample));

      buttonWithText(element, "Sunday").click();
      await nextTick();
      expect(firstWeekday(element)).toBe("Sun");
      expect(
        buttonWithText(element, "Sunday").getAttribute("aria-pressed")
      ).toBe("true");

      buttonWithText(element, "Monday").click();
      await nextTick();
      expect(firstWeekday(element)).toBe("Mon");
    }
  );
});

describe("calendarExample selection", () => {
  it("reports selected days", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const selected: Period[] = [];
    const props: Readonly<Record<string, unknown>> = {
      onSelect: (day: Period) => {
        selected.push(day);
      },
    };
    const { element } = mountRender(() => h(CalendarExample, props));
    const cells = [...element.querySelectorAll<HTMLElement>(".calendar-day")];

    itemAt(cells, FIRST).click();

    expect(selected).toHaveLength(ONE_DAY);
    expect(itemAt(selected, FIRST).unit).toBe("day");
  });
});
