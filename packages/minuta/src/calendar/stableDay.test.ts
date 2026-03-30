import { describe, it, expect } from "vitest";
import { createDateFnsTzAdapter } from "../adapters/date-fns-tz";
import { createStableDay } from "./stableDay";

describe("createStableDay", () => {
  describe("spring forward (23-hour day)", () => {
    const ny = createDateFnsTzAdapter({ timezone: "America/New_York" });

    it("returns 24 periods on spring forward day", () => {
      // Mar 10 2024: 2 AM doesn't exist in New York
      const { periods } = createStableDay(
        ny,
        new Date(Date.UTC(2024, 2, 10, 5)),
        "America/New_York"
      );
      expect(periods.length).toBe(24);
    });

    it("marks the skipped hour as a gap", () => {
      const { gapHour } = createStableDay(
        ny,
        new Date(Date.UTC(2024, 2, 10, 5)),
        "America/New_York"
      );
      expect(gapHour).toBe(2); // 2 AM is the gap
    });

    it("no ambiguous hours on spring forward", () => {
      const { ambiguousHour } = createStableDay(
        ny,
        new Date(Date.UTC(2024, 2, 10, 5)),
        "America/New_York"
      );
      expect(ambiguousHour).toBeNull();
    });
  });

  describe("fall back (25-hour day)", () => {
    const ny = createDateFnsTzAdapter({ timezone: "America/New_York" });

    it("returns 24 periods on fall back day", () => {
      // Nov 3 2024: 1 AM occurs twice in New York
      const { periods } = createStableDay(
        ny,
        new Date(Date.UTC(2024, 10, 3, 5)),
        "America/New_York"
      );
      expect(periods.length).toBe(24);
    });

    it("marks the repeated hour as ambiguous", () => {
      const { ambiguousHour } = createStableDay(
        ny,
        new Date(Date.UTC(2024, 10, 3, 5)),
        "America/New_York"
      );
      expect(ambiguousHour).toBe(1); // 1 AM repeats
    });

    it("no gaps on fall back", () => {
      const { gapHour } = createStableDay(
        ny,
        new Date(Date.UTC(2024, 10, 3, 5)),
        "America/New_York"
      );
      expect(gapHour).toBeNull();
    });
  });

  describe("Europe/Zurich spring forward", () => {
    const zurich = createDateFnsTzAdapter({ timezone: "Europe/Zurich" });

    it("returns 24 periods on Mar 31 2024", () => {
      // Mar 31 2024: 2 AM → 3 AM in Zurich (last Sun of March)
      const { periods } = createStableDay(
        zurich,
        new Date(Date.UTC(2024, 2, 31)),
        "Europe/Zurich"
      );
      expect(periods.length).toBe(24);
    });

    it("marks hour 2 as gap (2 AM → 3 AM)", () => {
      const { gapHour } = createStableDay(
        zurich,
        new Date(Date.UTC(2024, 2, 31)),
        "Europe/Zurich"
      );
      expect(gapHour).toBe(2);
    });
  });

  describe("Europe/Zurich fall back", () => {
    const zurich = createDateFnsTzAdapter({ timezone: "Europe/Zurich" });

    it("marks hour 2 as ambiguous (3 AM → 2 AM)", () => {
      // Oct 27 2024: 3 AM → 2 AM in Zurich (last Sun of October)
      const { ambiguousHour } = createStableDay(
        zurich,
        new Date(Date.UTC(2024, 9, 27)),
        "Europe/Zurich"
      );
      expect(ambiguousHour).toBe(2);
    });
  });

  describe("Europe/London spring forward", () => {
    const london = createDateFnsTzAdapter({ timezone: "Europe/London" });

    it("marks hour 1 as gap (1 AM → 2 AM)", () => {
      // Mar 31 2024: 1 AM → 2 AM in London (last Sun of March)
      const { gapHour } = createStableDay(
        london,
        new Date(Date.UTC(2024, 2, 31)),
        "Europe/London"
      );
      expect(gapHour).toBe(1);
    });
  });

  describe("Europe/London fall back", () => {
    const london = createDateFnsTzAdapter({ timezone: "Europe/London" });

    it("marks hour 1 as ambiguous (2 AM → 1 AM)", () => {
      // Oct 27 2024: 2 AM → 1 AM in London (last Sun of October)
      const { ambiguousHour } = createStableDay(
        london,
        new Date(Date.UTC(2024, 9, 27, 1)),
        "Europe/London"
      );
      expect(ambiguousHour).toBe(1);
    });
  });

  describe("Australia/Sydney spring forward", () => {
    const sydney = createDateFnsTzAdapter({ timezone: "Australia/Sydney" });

    it("marks hour 2 as gap (2 AM → 3 AM)", () => {
      // Oct 6 2024: 2 AM → 3 AM in Sydney (first Sun of October)
      const { gapHour } = createStableDay(
        sydney,
        new Date(Date.UTC(2024, 9, 6)),
        "Australia/Sydney"
      );
      expect(gapHour).toBe(2);
    });
  });

  describe("Australia/Sydney fall back", () => {
    const sydney = createDateFnsTzAdapter({ timezone: "Australia/Sydney" });

    it("marks hour 2 as ambiguous (3 AM → 2 AM)", () => {
      // Apr 6 2025: 3 AM → 2 AM in Sydney (first Sun of April)
      const { ambiguousHour } = createStableDay(
        sydney,
        new Date(Date.UTC(2025, 3, 6)),
        "Australia/Sydney"
      );
      expect(ambiguousHour).toBe(2);
    });
  });

  describe("Pacific/Auckland fall back", () => {
    const auckland = createDateFnsTzAdapter({ timezone: "Pacific/Auckland" });

    it("marks hour 2 as ambiguous (3 AM → 2 AM)", () => {
      // Apr 6 2025: 3 AM → 2 AM in Auckland (first Sun of April)
      const { ambiguousHour } = createStableDay(
        auckland,
        new Date(Date.UTC(2025, 3, 6)),
        "Pacific/Auckland"
      );
      expect(ambiguousHour).toBe(2);
    });
  });

  describe("Asia/Tokyo (no DST)", () => {
    const tokyo = createDateFnsTzAdapter({ timezone: "Asia/Tokyo" });

    it("never has gaps or ambiguous hours", () => {
      const { periods, gapHour, ambiguousHour } = createStableDay(
        tokyo,
        new Date(Date.UTC(2024, 2, 10)),
        "Asia/Tokyo"
      );
      expect(periods.length).toBe(24);
      expect(gapHour).toBeNull();
      expect(ambiguousHour).toBeNull();
    });
  });

  describe("UTC (no DST ever)", () => {
    const utc = createDateFnsTzAdapter({ timezone: "UTC" });

    it("never has gaps or ambiguous hours", () => {
      // Test on US spring forward date — UTC doesn't care
      const { periods, gapHour, ambiguousHour } = createStableDay(
        utc,
        new Date(Date.UTC(2024, 2, 10)),
        "UTC"
      );
      expect(periods.length).toBe(24);
      expect(gapHour).toBeNull();
      expect(ambiguousHour).toBeNull();
    });
  });
});
