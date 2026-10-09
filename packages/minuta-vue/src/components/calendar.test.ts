import {
  CalendarGrid,
  CalendarHeader,
  CalendarRoot,
} from "#src/components/index";
import type { Period, Units } from "minuta/core";
import { describe, expect, it } from "vitest";
import { h, nextTick } from "vue";
import { itemAt, mountRender } from "#src/test/mount";
import type { VNode } from "vue";
import { nativeUnits } from "minuta/native";

const DAYS_IN_GRID = 42;
const OUTSIDE_DAYS_MARCH_2024 = 11;
const SUNDAY = 0;
const FIRST_CELL = 0;
const MARCH_1_CELL = 4;
const MARCH_16_CELL = 19;
const NO_CELLS = 0;
const ONE_CELL = 1;

const testDate = new Date("2024-03-13T00:00:00");

type CalendarSetup = Readonly<{
  date?: Readonly<Date>;
  locale?: string;
  onSelect?: (day: Period) => void;
  units?: Units;
}>;

/**
 * Ignores a selected day.
 */
function ignore(): void {
  // Nothing to do without a listener
}

/**
 * Renders a calendar with a header and the grid.
 *
 * @param setup - Props of the root and the label locale
 * @returns The element holding the calendar
 */
function renderCalendar(setup: CalendarSetup = {}): HTMLElement {
  const { date = testDate, locale = "en-US", onSelect = ignore, units } = setup;
  const props: Readonly<Record<string, unknown>> = { date, onSelect, units };
  return mountRender(() =>
    h(CalendarRoot, props, {
      default: (): VNode[] => [
        h(CalendarHeader, { locale }),
        h(CalendarGrid, { locale }),
      ],
    })
  ).element;
}

/**
 * Finds the element of a test id.
 *
 * @param element - The container
 * @param testId - The data-testid value
 * @returns The element
 */
function byTestId(element: HTMLElement, testId: string): HTMLElement {
  const found = element.querySelector<HTMLElement>(`[data-testid="${testId}"]`);
  if (found === null) {
    throw new Error(`Missing ${testId}`);
  }
  return found;
}

/**
 * Lists the day buttons of the grid.
 *
 * @param element - The container
 * @returns The day buttons in grid order
 */
function dayCells(element: HTMLElement): HTMLElement[] {
  return [...element.querySelectorAll<HTMLElement>(".calendar-day")];
}

/**
 * Lists the day buttons that have a class.
 *
 * @param element - The container
 * @param className - The class to look for
 * @returns The matching day buttons
 */
function cellsWithClass(
  element: HTMLElement,
  className: string
): HTMLElement[] {
  return dayCells(element).filter((cell) => cell.classList.contains(className));
}

/**
 * Lists the weekday labels.
 *
 * @param element - The container
 * @returns The labels in column order
 */
function weekdayLabels(element: HTMLElement): string[] {
  const labels = byTestId(
    element,
    "calendar-weekdays"
  ).querySelectorAll<HTMLElement>("th");
  return [...labels].map((label) => label.textContent.trim());
}

describe("calendarHeader", () => {
  it("shows the browsed month", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const element = renderCalendar();

    expect(byTestId(element, "calendar-label").textContent).toBe("March 2024");
  });

  it("formats the month in its locale", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const element = renderCalendar({ locale: "de-CH" });

    expect(byTestId(element, "calendar-label").textContent).toBe("März 2024");
  });

  it("browses the previous and next month", { timeout: 5000 }, async () => {
    expect.hasAssertions();
    const element = renderCalendar();
    const label = byTestId(element, "calendar-label");

    byTestId(element, "calendar-next").click();
    await nextTick();
    expect(label.textContent).toBe("April 2024");

    byTestId(element, "calendar-previous").click();
    byTestId(element, "calendar-previous").click();
    await nextTick();
    expect(label.textContent).toBe("February 2024");
  });
});

describe("calendarWeekdays in calendarGrid", () => {
  it("starts on Monday with the default units", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const element = renderCalendar();

    expect(weekdayLabels(element)).toStrictEqual([
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun",
    ]);
  });

  it("follows the week start of the units", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const element = renderCalendar({
      units: nativeUnits({ weekStartsOn: SUNDAY }),
    });

    expect(weekdayLabels(element)).toStrictEqual([
      "Sun",
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
    ]);
  });
});

describe("calendarGrid", () => {
  it(
    "renders 42 days starting in the first weekday column",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const cells = dayCells(renderCalendar());

      expect(cells).toHaveLength(DAYS_IN_GRID);
      expect(itemAt(cells, FIRST_CELL).textContent).toBe("26");
    }
  );

  it("dims the days outside the month", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const element = renderCalendar();

    expect(cellsWithClass(element, "is-outside")).toHaveLength(
      OUTSIDE_DAYS_MARCH_2024
    );
    expect(
      itemAt(dayCells(element), MARCH_1_CELL).classList.contains("is-outside")
    ).toBe(false);
  });

  it("renders the day slot for every day", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { element } = mountRender(() =>
      h(
        CalendarRoot,
        { date: testDate },
        {
          default: (): VNode =>
            h(CalendarGrid, undefined, {
              day: ({ day }: Readonly<{ day: Period }>): VNode =>
                h("i", { class: "custom-day" }, day.start.getDate()),
            }),
        }
      )
    );

    expect(element.querySelectorAll(".custom-day")).toHaveLength(DAYS_IN_GRID);
    expect(dayCells(element)).toHaveLength(NO_CELLS);
  });
});

describe("calendarDay", () => {
  it("marks today", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const today = new Date();
    const marked = cellsWithClass(renderCalendar({ date: today }), "is-today");

    expect(marked).toHaveLength(ONE_CELL);
    expect(itemAt(marked, FIRST_CELL).getAttribute("aria-current")).toBe(
      "date"
    );
    expect(itemAt(marked, FIRST_CELL).textContent).toBe(
      String(today.getDate())
    );
  });
});

describe("calendarDay selection", () => {
  it("selects a day and reports it", { timeout: 5000 }, async () => {
    expect.hasAssertions();
    const selected: Period[] = [];
    const element = renderCalendar({
      onSelect: (day) => {
        selected.push(day);
      },
    });

    itemAt(dayCells(element), MARCH_16_CELL).click();
    await nextTick();

    const cell = itemAt(dayCells(element), MARCH_16_CELL);
    expect(selected.map((day) => day.start)).toStrictEqual([
      new Date("2024-03-16T00:00:00"),
    ]);
    expect(cell.classList.contains("is-selected")).toBe(true);
    expect(
      itemAt([...element.querySelectorAll("td")], MARCH_16_CELL).getAttribute(
        "aria-selected"
      )
    ).toBe("true");
  });

  it(
    "browses the month of a day outside the month",
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();
      const element = renderCalendar();

      itemAt(dayCells(element), FIRST_CELL).click();
      await nextTick();

      expect(byTestId(element, "calendar-label").textContent).toBe(
        "February 2024"
      );
    }
  );
});
