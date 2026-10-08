import { describe, expect, it } from "vitest";
import { createDateFnsTzAdapter } from "#src/adapters/date-fns-tz/index";
import { createStableDay } from "./stable-day";

const HOURS_PER_DAY = 24;
const ONE_AM = 1;
const TWO_AM = 2;

const NEW_YORK = "America/New_York";
const ZURICH = "Europe/Zurich";
const LONDON = "Europe/London";
const SYDNEY = "Australia/Sydney";
const AUCKLAND = "Pacific/Auckland";

// Mar 10 2024: 2 AM doesn't exist in New York
const NY_SPRING_FORWARD = new Date("2024-03-10T05:00:00Z");
// Nov 3 2024: 1 AM occurs twice in New York
const NY_FALL_BACK = new Date("2024-11-03T05:00:00Z");

describe("createStableDay() on a New York spring forward day", () => {
  const ny = createDateFnsTzAdapter({ timezone: NEW_YORK });

  it("returns 24 periods on spring forward day", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { periods } = createStableDay(ny, NY_SPRING_FORWARD, NEW_YORK);
    expect(periods).toHaveLength(HOURS_PER_DAY);
  });

  it("marks the skipped hour as a gap", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { gapHour } = createStableDay(ny, NY_SPRING_FORWARD, NEW_YORK);
    // 2 AM is the gap
    expect(gapHour).toBe(TWO_AM);
  });

  it("no ambiguous hours on spring forward", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { ambiguousHour } = createStableDay(ny, NY_SPRING_FORWARD, NEW_YORK);
    expect(ambiguousHour).toBeNull();
  });
});

describe("createStableDay() on a New York fall back day", () => {
  const ny = createDateFnsTzAdapter({ timezone: NEW_YORK });

  it("returns 24 periods on fall back day", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { periods } = createStableDay(ny, NY_FALL_BACK, NEW_YORK);
    expect(periods).toHaveLength(HOURS_PER_DAY);
  });

  it("marks the repeated hour as ambiguous", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { ambiguousHour } = createStableDay(ny, NY_FALL_BACK, NEW_YORK);
    // 1 AM repeats
    expect(ambiguousHour).toBe(ONE_AM);
  });

  it("no gaps on fall back", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { gapHour } = createStableDay(ny, NY_FALL_BACK, NEW_YORK);
    expect(gapHour).toBeNull();
  });
});

describe("createStableDay() on Europe/Zurich DST days", () => {
  const zurich = createDateFnsTzAdapter({ timezone: ZURICH });

  it("returns 24 periods on Mar 31 2024", { timeout: 5000 }, () => {
    expect.hasAssertions();
    // Mar 31 2024: 2 AM → 3 AM in Zurich (last Sun of March)
    const { periods } = createStableDay(
      zurich,
      new Date("2024-03-31T00:00:00Z"),
      ZURICH
    );
    expect(periods).toHaveLength(HOURS_PER_DAY);
  });

  it("marks hour 2 as gap (2 AM → 3 AM)", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { gapHour } = createStableDay(
      zurich,
      new Date("2024-03-31T00:00:00Z"),
      ZURICH
    );
    expect(gapHour).toBe(TWO_AM);
  });

  it("marks hour 2 as ambiguous (3 AM → 2 AM)", { timeout: 5000 }, () => {
    expect.hasAssertions();
    // Oct 27 2024: 3 AM → 2 AM in Zurich (last Sun of October)
    const { ambiguousHour } = createStableDay(
      zurich,
      new Date("2024-10-27T00:00:00Z"),
      ZURICH
    );
    expect(ambiguousHour).toBe(TWO_AM);
  });
});

describe("createStableDay() on Europe/London DST days", () => {
  const london = createDateFnsTzAdapter({ timezone: LONDON });

  it("marks hour 1 as gap (1 AM → 2 AM)", { timeout: 5000 }, () => {
    expect.hasAssertions();
    // Mar 31 2024: 1 AM → 2 AM in London (last Sun of March)
    const { gapHour } = createStableDay(
      london,
      new Date("2024-03-31T00:00:00Z"),
      LONDON
    );
    expect(gapHour).toBe(ONE_AM);
  });

  it("marks hour 1 as ambiguous (2 AM → 1 AM)", { timeout: 5000 }, () => {
    expect.hasAssertions();
    // Oct 27 2024: 2 AM → 1 AM in London (last Sun of October)
    const { ambiguousHour } = createStableDay(
      london,
      new Date("2024-10-27T01:00:00Z"),
      LONDON
    );
    expect(ambiguousHour).toBe(ONE_AM);
  });
});

describe("createStableDay() on southern hemisphere DST days", () => {
  const sydney = createDateFnsTzAdapter({ timezone: SYDNEY });
  const auckland = createDateFnsTzAdapter({ timezone: AUCKLAND });

  it("marks hour 2 as gap in Sydney (2 AM → 3 AM)", { timeout: 5000 }, () => {
    expect.hasAssertions();
    // Oct 6 2024: 2 AM → 3 AM in Sydney (first Sun of October)
    const { gapHour } = createStableDay(
      sydney,
      new Date("2024-10-06T00:00:00Z"),
      SYDNEY
    );
    expect(gapHour).toBe(TWO_AM);
  });

  it(
    "marks hour 2 as ambiguous in Sydney (3 AM → 2 AM)",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      // Apr 6 2025: 3 AM → 2 AM in Sydney (first Sun of April)
      const { ambiguousHour } = createStableDay(
        sydney,
        new Date("2025-04-06T00:00:00Z"),
        SYDNEY
      );
      expect(ambiguousHour).toBe(TWO_AM);
    }
  );

  it(
    "marks hour 2 as ambiguous in Auckland (3 AM → 2 AM)",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      // Apr 6 2025: 3 AM → 2 AM in Auckland (first Sun of April)
      const { ambiguousHour } = createStableDay(
        auckland,
        new Date("2025-04-06T00:00:00Z"),
        AUCKLAND
      );
      expect(ambiguousHour).toBe(TWO_AM);
    }
  );
});

describe("createStableDay() in zones without DST", () => {
  it(
    "never has gaps or ambiguous hours in Asia/Tokyo",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const tokyo = createDateFnsTzAdapter({ timezone: "Asia/Tokyo" });
      const { periods, gapHour, ambiguousHour } = createStableDay(
        tokyo,
        new Date("2024-03-10T00:00:00Z"),
        "Asia/Tokyo"
      );
      expect(periods).toHaveLength(HOURS_PER_DAY);
      expect(gapHour).toBeNull();
      expect(ambiguousHour).toBeNull();
    }
  );

  it("never has gaps or ambiguous hours in UTC", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const utc = createDateFnsTzAdapter({ timezone: "UTC" });
    // Test on US spring forward date — UTC doesn't care
    const { periods, gapHour, ambiguousHour } = createStableDay(
      utc,
      new Date("2024-03-10T00:00:00Z"),
      "UTC"
    );
    expect(periods).toHaveLength(HOURS_PER_DAY);
    expect(gapHour).toBeNull();
    expect(ambiguousHour).toBeNull();
  });
});
