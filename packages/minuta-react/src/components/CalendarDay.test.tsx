import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { CalendarDay } from "./CalendarDay";
import { CalendarGrid } from "./CalendarGrid";
import { CalendarHeader } from "./CalendarHeader";
import { CalendarRoot } from "./CalendarRoot";
import type { Period } from "minuta/core";
import type { RenderResult } from "@testing-library/react";
import { period } from "minuta";

type OnSelect = (day: Period) => void;

const ONE = 1;
const SELECTED_DAY = 20;
const JANUARY_15: Period = period(new Date("2024-01-15T00:00:00"), "day");

function renderCalendar(
  date: Readonly<Date>,
  onSelect?: OnSelect
): RenderResult {
  return render(
    <CalendarRoot date={date} onSelect={onSelect}>
      <CalendarHeader />
      <CalendarGrid />
    </CalendarRoot>
  );
}

function only(elements: readonly HTMLElement[]): HTMLElement {
  const [first] = elements;
  if (first === undefined || elements.length !== ONE) {
    throw new Error(`Expected one element, got ${String(elements.length)}`);
  }
  return first;
}

function dayButton(day: number): HTMLElement {
  return only(
    screen
      .getAllByRole("button")
      .filter(
        (button: HTMLElement) =>
          button.textContent.startsWith(String(day)) &&
          !button.classList.contains("is-outside")
      )
  );
}

function gridCell(button: HTMLElement): HTMLElement {
  const cell = button.closest("td");
  if (cell === null) {
    throw new Error("Expected the day inside a grid cell");
  }
  return cell;
}

function lastOutsideDay(container: HTMLElement): HTMLElement {
  const outside = [...container.querySelectorAll<HTMLElement>(".is-outside")];
  return only(outside.slice(-ONE));
}

describe("<CalendarDay> states", () => {
  afterEach(cleanup);

  it("should mark today", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { container } = renderCalendar(new Date());

    const today = only([
      ...container.querySelectorAll<HTMLElement>('[aria-current="date"]'),
    ]);
    expect(today.classList.contains("is-today")).toBe(true);
  });

  it(
    "should render a single day inside CalendarRoot",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      render(
        <CalendarRoot date={JANUARY_15.start}>
          <CalendarDay day={JANUARY_15} />
        </CalendarRoot>
      );

      expect(screen.getByRole("button").title).toBe("Mon");
    }
  );
});

describe("<CalendarDay> selection", () => {
  afterEach(cleanup);

  it("should report the clicked day", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const onSelect = vi.fn<OnSelect>();
    renderCalendar(JANUARY_15.start, onSelect);

    fireEvent.click(dayButton(SELECTED_DAY));

    expect(onSelect).toHaveBeenCalledWith(
      period(new Date("2024-01-20T00:00:00"), "day")
    );
  });

  it("should mark the clicked day as selected", { timeout: 5000 }, () => {
    expect.hasAssertions();
    renderCalendar(JANUARY_15.start);

    fireEvent.click(dayButton(SELECTED_DAY));

    expect(
      gridCell(dayButton(SELECTED_DAY)).getAttribute("aria-selected")
    ).toBe("true");
    expect(dayButton(SELECTED_DAY).classList.contains("is-selected")).toBe(
      true
    );
  });

  it("should browse to the month of an outside day", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { container } = renderCalendar(JANUARY_15.start);

    fireEvent.click(lastOutsideDay(container));

    expect(screen.getByRole("heading").textContent).toBe("February 2024");
  });
});
