import { describe, expect, it } from "vitest";
import { dateFnsTzUnits } from "#src/adapters/date-fns-tz/index";
import { dayGridWith } from "./day-grid";
import { length } from "#src/operations/duration";
import { nativeUnits } from "#src/adapters/native/index";
import { periodWith } from "#src/operations/period";

const HOURS_PER_DAY = 24;
const MS_PER_HOUR = 3_600_000;
const FIRST = 0;
const LAST = -1;
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

describe("dayGridWith() on a New York spring forward day", () => {
  const ny = dateFnsTzUnits({ timeZone: NEW_YORK });

  it(
    "returns the 23 real hours of a spring forward day",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const { periods } = dayGridWith(ny, NY_SPRING_FORWARD);
      expect(periods).toHaveLength(HOURS_PER_DAY - ONE_AM);
      expect(periods.map((slot) => slot.hour)).not.toContain(TWO_AM);
    }
  );

  it("marks the skipped hour as a gap", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { gapHour } = dayGridWith(ny, NY_SPRING_FORWARD);
    // 2 AM is the gap
    expect(gapHour).toBe(TWO_AM);
  });

  it("no ambiguous hours on spring forward", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { ambiguousHour } = dayGridWith(ny, NY_SPRING_FORWARD);
    expect(ambiguousHour).toBeUndefined();
  });
});

describe("dayGridWith() on a New York fall back day", () => {
  const ny = dateFnsTzUnits({ timeZone: NEW_YORK });

  it("returns the 25 real hours of a fall back day", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { periods } = dayGridWith(ny, NY_FALL_BACK);
    expect(periods).toHaveLength(HOURS_PER_DAY + ONE_AM);
  });

  it("marks the repeated hour as ambiguous", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { ambiguousHour } = dayGridWith(ny, NY_FALL_BACK);
    // 1 AM repeats
    expect(ambiguousHour).toBe(ONE_AM);
  });

  it("no gaps on fall back", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { gapHour } = dayGridWith(ny, NY_FALL_BACK);
    expect(gapHour).toBeUndefined();
  });
});

describe("dayGridWith() on Europe/Zurich DST days", () => {
  const zurich = dateFnsTzUnits({ timeZone: ZURICH });

  it("returns the 23 real hours of Mar 31 2024", { timeout: 5000 }, () => {
    expect.hasAssertions();
    // Mar 31 2024: 2 AM → 3 AM in Zurich (last Sun of March)
    const { periods } = dayGridWith(zurich, new Date("2024-03-31T00:00:00Z"));
    expect(periods).toHaveLength(HOURS_PER_DAY - ONE_AM);
  });

  it("marks hour 2 as gap (2 AM → 3 AM)", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { gapHour } = dayGridWith(zurich, new Date("2024-03-31T00:00:00Z"));
    expect(gapHour).toBe(TWO_AM);
  });

  it("marks hour 2 as ambiguous (3 AM → 2 AM)", { timeout: 5000 }, () => {
    expect.hasAssertions();
    // Oct 27 2024: 3 AM → 2 AM in Zurich (last Sun of October)
    const { ambiguousHour } = dayGridWith(
      zurich,
      new Date("2024-10-27T00:00:00Z")
    );
    expect(ambiguousHour).toBe(TWO_AM);
  });
});

describe("dayGridWith() on Europe/London DST days", () => {
  const london = dateFnsTzUnits({ timeZone: LONDON });

  it("marks hour 1 as gap (1 AM → 2 AM)", { timeout: 5000 }, () => {
    expect.hasAssertions();
    // Mar 31 2024: 1 AM → 2 AM in London (last Sun of March)
    const { gapHour } = dayGridWith(london, new Date("2024-03-31T00:00:00Z"));
    expect(gapHour).toBe(ONE_AM);
  });

  it("marks hour 1 as ambiguous (2 AM → 1 AM)", { timeout: 5000 }, () => {
    expect.hasAssertions();
    // Oct 27 2024: 2 AM → 1 AM in London (last Sun of October)
    const { ambiguousHour } = dayGridWith(
      london,
      new Date("2024-10-27T01:00:00Z")
    );
    expect(ambiguousHour).toBe(ONE_AM);
  });
});

describe("dayGridWith() on southern hemisphere DST days", () => {
  const sydney = dateFnsTzUnits({ timeZone: SYDNEY });
  const auckland = dateFnsTzUnits({ timeZone: AUCKLAND });

  it("marks hour 2 as gap in Sydney (2 AM → 3 AM)", { timeout: 5000 }, () => {
    expect.hasAssertions();
    // Oct 6 2024: 2 AM → 3 AM in Sydney (first Sun of October)
    const { gapHour } = dayGridWith(sydney, new Date("2024-10-06T00:00:00Z"));
    expect(gapHour).toBe(TWO_AM);
  });

  it(
    "marks hour 2 as ambiguous in Sydney (3 AM → 2 AM)",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      // Apr 6 2025: 3 AM → 2 AM in Sydney (first Sun of April)
      const { ambiguousHour } = dayGridWith(
        sydney,
        new Date("2025-04-06T00:00:00Z")
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
      const { ambiguousHour } = dayGridWith(
        auckland,
        new Date("2025-04-06T00:00:00Z")
      );
      expect(ambiguousHour).toBe(TWO_AM);
    }
  );
});

describe("dayGridWith() in zones without DST", () => {
  it(
    "never has gaps or ambiguous hours in Asia/Tokyo",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const tokyo = dateFnsTzUnits({ timeZone: "Asia/Tokyo" });
      const { periods, gapHour, ambiguousHour } = dayGridWith(
        tokyo,
        new Date("2024-03-10T00:00:00Z")
      );
      expect(periods).toHaveLength(HOURS_PER_DAY);
      expect(gapHour).toBeUndefined();
      expect(ambiguousHour).toBeUndefined();
    }
  );

  it("never has gaps or ambiguous hours in UTC", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const utc = dateFnsTzUnits({ timeZone: "UTC" });
    // Test on US spring forward date — UTC doesn't care
    const { periods, gapHour, ambiguousHour } = dayGridWith(
      utc,
      new Date("2024-03-10T00:00:00Z")
    );
    expect(periods).toHaveLength(HOURS_PER_DAY);
    expect(gapHour).toBeUndefined();
    expect(ambiguousHour).toBeUndefined();
  });
});

describe("dayGridWith() in the runtime zone", () => {
  const units = nativeUnits();

  it.each([
    "2026-03-08T12:00",
    "2026-03-29T12:00",
    "2026-10-25T12:00",
    "2026-11-01T12:00",
  ])("covers exactly the day of %s", { timeout: 5000 }, (iso) => {
    expect.hasAssertions();
    const day = periodWith(units, new Date(iso), "day");
    const { periods } = dayGridWith(units, day.start);
    expect(periods).toHaveLength(length(day) / MS_PER_HOUR);
    expect(periods.at(FIRST)).toHaveProperty("start", day.start);
    expect(periods.at(LAST)).toHaveProperty("end", day.end);
  });
});
