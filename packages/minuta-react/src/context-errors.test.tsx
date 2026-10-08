import { describe, expect, it, vi } from "vitest";
import { render, renderHook } from "@testing-library/react";
import { CalendarDay } from "./components/CalendarDay";
import { CalendarHeader } from "./components/CalendarHeader";
import { MinutaRoot } from "./minuta-root";
import { period } from "minuta";
import { useMinutaContext } from "./minuta-context";
import { usePeriod } from "./use-period";

function silence(): void {
  // Expected errors are asserted, not printed
}

function preventReport(event: Event): void {
  event.preventDefault();
}

function suppressErrorOutput(run: () => void): void {
  const consoleError = vi.spyOn(console, "error").mockImplementation(silence);
  // An unhandled window error event is printed to stderr by jsdom
  globalThis.addEventListener("error", preventReport);
  try {
    run();
  } finally {
    globalThis.removeEventListener("error", preventReport);
    consoleError.mockRestore();
  }
}

describe("useMinutaContext() outside MinutaRoot", () => {
  it("should throw a clear error", { timeout: 5000 }, () => {
    expect.hasAssertions();

    suppressErrorOutput(() => {
      expect(() => {
        renderHook(() => useMinutaContext());
      }).toThrow("useMinutaContext() must be used within <MinutaRoot>");
    });
  });

  it("should throw from usePeriod()", { timeout: 5000 }, () => {
    expect.hasAssertions();

    suppressErrorOutput(() => {
      expect(() => {
        renderHook(() => usePeriod("month"));
      }).toThrow("must be used within <MinutaRoot>");
    });
  });
});

describe("calendar parts outside their root", () => {
  it("should throw from a part outside MinutaRoot", { timeout: 5000 }, () => {
    expect.hasAssertions();

    suppressErrorOutput(() => {
      expect(() => {
        render(<CalendarHeader />);
      }).toThrow("must be used within <MinutaRoot>");
    });
  });

  it(
    "should throw from CalendarDay outside CalendarRoot",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const day = period(new Date("2024-01-15T00:00:00"), "day");

      suppressErrorOutput(() => {
        expect(() => {
          render(
            <MinutaRoot>
              <CalendarDay day={day} />
            </MinutaRoot>
          );
        }).toThrow("Calendar parts must be used within <CalendarRoot>");
      });
    }
  );
});
