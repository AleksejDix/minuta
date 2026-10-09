import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { CalendarGrid } from "./CalendarGrid";
import { CalendarHeader } from "./CalendarHeader";
import { CalendarRoot } from "./CalendarRoot";
import type { Period } from "minuta/core";
import type { RenderResult } from "@testing-library/react";
import { isWeekendWith } from "minuta/calendar";
import { nativeUnits } from "minuta/native";

type Setup = Readonly<{
  date?: Readonly<Date>;
  isDisabled?: (day: Period) => boolean;
  locale?: string;
  onSelect?: (day: Period) => void;
}>;

const JANUARY_15 = new Date("2024-01-15T00:00:00");
const JANUARY_17 = "Wednesday, January 17, 2024";
const GRID_ROWS = 7;
const ONE = 1;

function renderCalendar(setup: Setup = {}): RenderResult {
  const { date = JANUARY_15, isDisabled, locale, onSelect } = setup;
  return render(
    <CalendarRoot date={date} isDisabled={isDisabled} onSelect={onSelect}>
      <CalendarHeader locale={locale} />
      <CalendarGrid locale={locale} />
    </CalendarRoot>
  );
}

function tabbable(container: HTMLElement): HTMLElement {
  const days = [...container.querySelectorAll<HTMLElement>('[tabindex="0"]')];
  const [first] = days;
  if (first === undefined || days.length !== ONE) {
    throw new Error(`Expected one tabbable day, got ${String(days.length)}`);
  }
  return first;
}

function selectedCells(container: HTMLElement): string[] {
  return [
    ...container.querySelectorAll<HTMLElement>('td[aria-selected="true"]'),
  ].map((cell) => cell.textContent);
}

function isWeekend(day: Period): boolean {
  return isWeekendWith(nativeUnits(), day);
}

describe("calendar grid semantics", () => {
  afterEach(cleanup);

  it("should label the grid with the month heading", { timeout: 5000 }, () => {
    expect.hasAssertions();
    renderCalendar();

    expect(screen.getByRole("grid", { name: "January 2024" })).toBeDefined();
    expect(screen.getByRole("heading").getAttribute("aria-live")).toBe(
      "polite"
    );
    expect(screen.getAllByRole("row")).toHaveLength(GRID_ROWS);
  });

  it("should name the weekday columns in full", { timeout: 5000 }, () => {
    expect.hasAssertions();
    renderCalendar({ locale: "de-CH" });
    const headers = screen.getAllByRole("columnheader");

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

  it("should label every day with its full date", { timeout: 5000 }, () => {
    expect.hasAssertions();
    renderCalendar();

    expect(screen.getByRole("button", { name: JANUARY_17 }).textContent).toBe(
      "17Wed"
    );
  });
});

describe("calendar header semantics", () => {
  afterEach(cleanup);

  it("should name the month buttons", { timeout: 5000 }, () => {
    expect.hasAssertions();
    renderCalendar();

    expect(
      screen.getByRole("button", { name: "Previous month" })
    ).toBeDefined();
    expect(screen.getByRole("button", { name: "Next month" })).toBeDefined();
  });
});

describe("calendar roving tabindex", () => {
  afterEach(cleanup);

  it("should start on the first of the month", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { container } = renderCalendar();

    expect(tabbable(container).getAttribute("aria-label")).toBe(
      "Monday, January 1, 2024"
    );
  });

  it("should start on today when it is shown", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { container } = renderCalendar({ date: new Date() });

    expect(tabbable(container).getAttribute("aria-current")).toBe("date");
  });

  it("should follow the selected day", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { container } = renderCalendar();

    fireEvent.click(screen.getByRole("button", { name: JANUARY_17 }));

    expect(tabbable(container).getAttribute("aria-label")).toBe(JANUARY_17);
    expect(selectedCells(container)).toStrictEqual(["17Wed"]);
  });
});

describe("calendar disabled days", () => {
  afterEach(cleanup);

  it("should mark disabled days", { timeout: 5000 }, () => {
    expect.hasAssertions();
    renderCalendar({ isDisabled: isWeekend });
    const sunday = screen.getByRole("button", {
      name: "Sunday, January 14, 2024",
    });

    expect(sunday.getAttribute("aria-disabled")).toBe("true");
    expect(
      screen
        .getByRole("button", { name: JANUARY_17 })
        .getAttribute("aria-disabled")
    ).toBe("false");
  });

  it("should not select a disabled day", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const onSelect = vi.fn<(day: Period) => void>();
    const { container } = renderCalendar({ isDisabled: isWeekend, onSelect });
    const sunday = screen.getByRole("button", {
      name: "Sunday, January 14, 2024",
    });

    fireEvent.click(sunday);
    sunday.focus();
    fireEvent.keyDown(sunday, { key: "Enter" });

    expect(onSelect).not.toHaveBeenCalled();
    expect(selectedCells(container)).toStrictEqual([]);
  });
});
