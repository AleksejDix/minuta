import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { CalendarExample } from "./CalendarExample";
import type { Period } from "minuta/core";

const ONE = 1;
const FIRST = 0;

function weekdays(container: HTMLElement): string[] {
  return [...container.querySelectorAll<HTMLElement>(".weekday-grid span")].map(
    (label: HTMLElement) => label.textContent
  );
}

function firstDay(container: HTMLElement): HTMLElement {
  const [first] = container.querySelectorAll<HTMLElement>(".day-cell");
  if (first === undefined) {
    throw new Error("Missing day button");
  }
  return first;
}

describe("<CalendarExample>", () => {
  afterEach(cleanup);

  it("should compose the calendar parts", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { container } = render(<CalendarExample />);

    expect(screen.getByText("Next →").tagName).toBe("BUTTON");
    expect(weekdays(container)[FIRST]).toBe("Mon");
  });

  it("should start weeks on Sunday after the toggle", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { container } = render(<CalendarExample />);

    fireEvent.click(screen.getByRole("button", { name: "Sunday" }));

    expect(weekdays(container)[FIRST]).toBe("Sun");
  });

  it("should start weeks on Monday again", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { container } = render(<CalendarExample />);

    fireEvent.click(screen.getByRole("button", { name: "Sunday" }));
    fireEvent.click(screen.getByRole("button", { name: "Monday" }));

    expect(weekdays(container)[FIRST]).toBe("Mon");
  });

  it("should report the selected day", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const onSelect = vi.fn<(day: Period) => void>();
    const { container } = render(<CalendarExample onSelect={onSelect} />);

    fireEvent.click(firstDay(container));

    expect(onSelect).toHaveBeenCalledTimes(ONE);
  });
});
