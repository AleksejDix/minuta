import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { CalendarGrid } from "./CalendarGrid";
import { CalendarHeader } from "./CalendarHeader";
import { CalendarRoot } from "./CalendarRoot";
import { CalendarWeekdays } from "./CalendarWeekdays";
import type { RenderResult } from "@testing-library/react";
import type { WeekStart } from "./week-start";
import { nativeUnits } from "minuta/native";

const GRID_DAYS = 42;
const JANUARY_2024_OUTSIDE_DAYS = 11;
const MONDAY: WeekStart = 1;
const SUNDAY: WeekStart = 0;
const NO_DAYS = 0;

function renderCalendar(weekStartsOn: WeekStart = MONDAY): RenderResult {
  return render(
    <CalendarRoot
      date={new Date("2024-01-15T00:00:00")}
      units={nativeUnits({ weekStartsOn })}
    >
      <CalendarHeader />
      <CalendarWeekdays />
      <CalendarGrid />
    </CalendarRoot>
  );
}

function texts(container: HTMLElement, selector: string): string[] {
  return [...container.querySelectorAll<HTMLElement>(selector)].map(
    (element: HTMLElement) => element.textContent
  );
}

function heading(): string {
  return screen.getByRole("heading").textContent;
}

describe("<CalendarHeader>", () => {
  afterEach(cleanup);

  it("should label the browsed month", { timeout: 5000 }, () => {
    expect.hasAssertions();
    renderCalendar();

    expect(heading()).toBe("January 2024");
  });

  it("should browse to the next month", { timeout: 5000 }, () => {
    expect.hasAssertions();
    renderCalendar();

    fireEvent.click(screen.getByText("Next →"));

    expect(heading()).toBe("February 2024");
  });

  it("should browse to the previous month", { timeout: 5000 }, () => {
    expect.hasAssertions();
    renderCalendar();

    fireEvent.click(screen.getByText("← Previous"));

    expect(heading()).toBe("December 2023");
  });
});

describe("<CalendarWeekdays>", () => {
  afterEach(cleanup);

  it("should start on Monday by default", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { container } = renderCalendar();

    expect(texts(container, ".weekday-grid span")).toStrictEqual([
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun",
    ]);
  });

  it("should follow the week start of the units", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { container } = renderCalendar(SUNDAY);

    expect(texts(container, ".weekday-grid span")).toStrictEqual([
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

describe("<CalendarGrid>", () => {
  afterEach(cleanup);

  it("should render the stable 42-day grid", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { container } = renderCalendar();

    expect(container.querySelectorAll(".day-cell")).toHaveLength(GRID_DAYS);
    expect(container.querySelectorAll(".is-outside")).toHaveLength(
      JANUARY_2024_OUTSIDE_DAYS
    );
  });

  it("should start a Monday week on the first", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { container } = renderCalendar();

    expect(texts(container, ".date-number")[NO_DAYS]).toBe("1");
  });

  it("should start a Sunday week in December", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { container } = renderCalendar(SUNDAY);

    expect(texts(container, ".date-number")[NO_DAYS]).toBe("31");
  });

  it("should render days with the children function", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { container } = render(
      <CalendarRoot date={new Date("2024-01-15T00:00:00")}>
        <CalendarGrid>
          {(day) => <i className="custom">{day.start.getDate()}</i>}
        </CalendarGrid>
      </CalendarRoot>
    );

    expect(container.querySelectorAll(".custom")).toHaveLength(GRID_DAYS);
    expect(container.querySelectorAll(".day-cell")).toHaveLength(NO_DAYS);
  });
});
