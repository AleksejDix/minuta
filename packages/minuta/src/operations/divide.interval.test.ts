import { describe, expect, it } from "vitest";
import type { ReadonlyPeriod } from "#src/types";
import { createNativeAdapter } from "#src/adapters/native/index";
import { divide } from "./divide";
import { derivePeriod as period } from "./period";

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

const adapter = createNativeAdapter();

function required(slot: ReadonlyPeriod | undefined): ReadonlyPeriod {
  if (slot === undefined) {
    throw new Error("Expected a slot");
  }
  return slot;
}

describe("divide() with minute counts", () => {
  it("divides an hour into 15-minute slots", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const hour = period(adapter, new Date("2024-01-01T10:00"), "hour");
    const slots = divide(adapter, hour, "minute", FIFTEEN);
    const [first, second, third, fourth] = slots;

    expect(slots).toHaveLength(FOUR);
    expect(required(first).start).toStrictEqual(new Date("2024-01-01T10:00"));
    expect(required(second).start).toStrictEqual(new Date("2024-01-01T10:15"));
    expect(required(third).start).toStrictEqual(new Date("2024-01-01T10:30"));
    expect(required(fourth).start).toStrictEqual(new Date("2024-01-01T10:45"));
  });

  it("divides a day into 30-minute slots", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const day = period(adapter, new Date("2024-01-01T00:00"), "day");
    const slots = divide(adapter, day, "minute", THIRTY);

    expect(slots).toHaveLength(FORTY_EIGHT);
  });

  it("divides an hour into 20-minute slots (uneven)", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const hour = period(adapter, new Date("2024-01-01T10:00"), "hour");
    const slots = divide(adapter, hour, "minute", TWENTY);
    const [first, second, third] = slots;

    expect(slots).toHaveLength(THREE);
    expect(required(first).start).toStrictEqual(new Date("2024-01-01T10:00"));
    expect(required(second).start).toStrictEqual(new Date("2024-01-01T10:20"));
    expect(required(third).start).toStrictEqual(new Date("2024-01-01T10:40"));
  });
});

describe("divide() with hour and month counts", () => {
  it("divides a day into 2-hour slots", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const day = period(adapter, new Date("2024-01-01T00:00"), "day");
    const slots = divide(adapter, day, "hour", TWO);
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
    const year = period(adapter, new Date("2024-01-01T00:00"), "year");
    const quarters = divide(adapter, year, "month", THREE);
    const [jan, apr, jul, oct] = quarters;

    expect(quarters).toHaveLength(FOUR);
    expect(required(jan).start).toStrictEqual(new Date("2024-01-01T00:00"));
    expect(required(apr).start).toStrictEqual(new Date("2024-04-01T00:00"));
    expect(required(jul).start).toStrictEqual(new Date("2024-07-01T00:00"));
    expect(required(oct).start).toStrictEqual(new Date("2024-10-01T00:00"));
  });

  it("divides a year into 2-week chunks", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const year = period(adapter, new Date("2024-01-01T00:00"), "year");
    const biweekly = divide(adapter, year, "week", TWO);

    expect(biweekly.length).toBeGreaterThanOrEqual(MIN_BIWEEKLY);
    expect(biweekly.length).toBeLessThanOrEqual(MAX_BIWEEKLY);
  });
});

describe("divide() slot properties", () => {
  it("slots are contiguous (no gaps)", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const hour = period(adapter, new Date("2024-01-01T10:00"), "hour");
    const slots = divide(adapter, hour, "minute", FIFTEEN);

    for (const [index, slot] of slots.slice(SINGLE).entries()) {
      const previous = required(slots[index]);
      expect(slot.start.getTime()).toBe(previous.end.getTime() + ONE_MS);
    }
  });

  it("slots have type custom when count > 1", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const hour = period(adapter, new Date("2024-01-01T10:00"), "hour");
    const slots = divide(adapter, hour, "minute", FIFTEEN);

    for (const slot of slots) {
      expect(slot.type).toBe("custom");
    }
  });

  it("count=1 behaves like original divide", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const year = period(adapter, new Date("2024-01-01T00:00"), "year");
    const months = divide(adapter, year, "month", SINGLE);
    const [first] = months;

    expect(months).toHaveLength(TWELVE);
    expect(required(first).type).toBe("month");
  });
});
