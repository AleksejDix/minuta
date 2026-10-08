import { describe, expect, it } from "vitest";
import type { Period } from "#src/types";
import { divideWith } from "./divide";
import { nativeUnits } from "#src/adapters/native/index";
import { periodWith } from "./period";

const ONE_MS = 1;
const SINGLE = 1;
const TWO = 2;
const THREE = 3;
const FOUR = 4;
const TWELVE = 12;
const FIFTEEN = 15;
const TWENTY = 20;
const THIRTY = 30;
const FORTY_EIGHT = 48;
const MIN_BIWEEKLY = 26;
const MAX_BIWEEKLY = 27;

const units = nativeUnits();

function required(slot: Period | undefined): Period {
  if (slot === undefined) {
    throw new Error("Expected a slot");
  }
  return slot;
}

describe("divideWith() with minute counts", () => {
  it("divides an hour into 15-minute slots", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const hour = periodWith(units, new Date("2024-01-01T10:00"), "hour");
    const slots = divideWith(units, hour, "minute", { step: FIFTEEN });
    const [first, second, third, fourth] = slots;

    expect(slots).toHaveLength(FOUR);
    expect(required(first).start).toStrictEqual(new Date("2024-01-01T10:00"));
    expect(required(second).start).toStrictEqual(new Date("2024-01-01T10:15"));
    expect(required(third).start).toStrictEqual(new Date("2024-01-01T10:30"));
    expect(required(fourth).start).toStrictEqual(new Date("2024-01-01T10:45"));
  });

  it("divides a day into 30-minute slots", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const day = periodWith(units, new Date("2024-01-01T00:00"), "day");
    const slots = divideWith(units, day, "minute", { step: THIRTY });

    expect(slots).toHaveLength(FORTY_EIGHT);
  });

  it("divides an hour into 20-minute slots (uneven)", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const hour = periodWith(units, new Date("2024-01-01T10:00"), "hour");
    const slots = divideWith(units, hour, "minute", { step: TWENTY });
    const [first, second, third] = slots;

    expect(slots).toHaveLength(THREE);
    expect(required(first).start).toStrictEqual(new Date("2024-01-01T10:00"));
    expect(required(second).start).toStrictEqual(new Date("2024-01-01T10:20"));
    expect(required(third).start).toStrictEqual(new Date("2024-01-01T10:40"));
  });
});

describe("divideWith() with hour and month counts", () => {
  it("divides a day into 2-hour slots", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const day = periodWith(units, new Date("2024-01-01T00:00"), "day");
    const slots = divideWith(units, day, "hour", { step: TWO });
    const [first, second] = slots;

    expect(slots).toHaveLength(TWELVE);
    expect(required(first).start).toStrictEqual(new Date("2024-01-01T00:00"));
    expect(required(second).start).toStrictEqual(new Date("2024-01-01T02:00"));
    expect(required(slots.at(-SINGLE)).start).toStrictEqual(
      new Date("2024-01-01T22:00")
    );
  });

  it("divides a year into quarters (3-month chunks)", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const year = periodWith(units, new Date("2024-01-01T00:00"), "year");
    const quarters = divideWith(units, year, "month", { step: THREE });
    const [jan, apr, jul, oct] = quarters;

    expect(quarters).toHaveLength(FOUR);
    expect(required(jan).start).toStrictEqual(new Date("2024-01-01T00:00"));
    expect(required(apr).start).toStrictEqual(new Date("2024-04-01T00:00"));
    expect(required(jul).start).toStrictEqual(new Date("2024-07-01T00:00"));
    expect(required(oct).start).toStrictEqual(new Date("2024-10-01T00:00"));
  });

  it("divides a year into 2-week chunks", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const year = periodWith(units, new Date("2024-01-01T00:00"), "year");
    const biweekly = divideWith(units, year, "week", { step: TWO });

    expect(biweekly.length).toBeGreaterThanOrEqual(MIN_BIWEEKLY);
    expect(biweekly.length).toBeLessThanOrEqual(MAX_BIWEEKLY);
  });
});

describe("divideWith() slot properties", () => {
  it("slots are contiguous (no gaps)", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const hour = periodWith(units, new Date("2024-01-01T10:00"), "hour");
    const slots = divideWith(units, hour, "minute", { step: FIFTEEN });

    for (const [index, slot] of slots.slice(SINGLE).entries()) {
      const previous = required(slots[index]);
      expect(slot.start.getTime()).toBe(previous.end.getTime() + ONE_MS);
    }
  });

  it("slots have unit custom when step > 1", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const hour = periodWith(units, new Date("2024-01-01T10:00"), "hour");
    const slots = divideWith(units, hour, "minute", { step: FIFTEEN });

    for (const slot of slots) {
      expect(slot.unit).toBe("custom");
    }
  });

  it("step=1 behaves like plain divide", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const year = periodWith(units, new Date("2024-01-01T00:00"), "year");
    const months = divideWith(units, year, "month", { step: SINGLE });
    const [first] = months;

    expect(months).toHaveLength(TWELVE);
    expect(required(first).unit).toBe("month");
  });
});
