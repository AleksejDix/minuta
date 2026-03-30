import { describe, it, expect } from "vitest";
import { divide } from "./divide";
import { derivePeriod as period } from "./period";
import { createNativeAdapter } from "../adapters/native";

const adapter = createNativeAdapter();

describe("divide with count (intervals)", () => {
  it("divides an hour into 15-minute slots", () => {
    const hour = period(adapter, new Date(2024, 0, 1, 10), "hour");
    const slots = divide(adapter, hour, "minute", 15);

    expect(slots).toHaveLength(4);
    expect(slots[0].start.getMinutes()).toBe(0);
    expect(slots[1].start.getMinutes()).toBe(15);
    expect(slots[2].start.getMinutes()).toBe(30);
    expect(slots[3].start.getMinutes()).toBe(45);
  });

  it("divides a day into 30-minute slots", () => {
    const day = period(adapter, new Date(2024, 0, 1), "day");
    const slots = divide(adapter, day, "minute", 30);

    expect(slots).toHaveLength(48);
  });

  it("divides a day into 2-hour slots", () => {
    const day = period(adapter, new Date(2024, 0, 1), "day");
    const slots = divide(adapter, day, "hour", 2);

    expect(slots).toHaveLength(12);
    expect(slots[0].start.getHours()).toBe(0);
    expect(slots[1].start.getHours()).toBe(2);
    expect(slots[11].start.getHours()).toBe(22);
  });

  it("divides a year into quarters (3-month chunks)", () => {
    const year = period(adapter, new Date(2024, 0, 1), "year");
    const quarters = divide(adapter, year, "month", 3);

    expect(quarters).toHaveLength(4);
    expect(quarters[0].start.getMonth()).toBe(0); // Jan
    expect(quarters[1].start.getMonth()).toBe(3); // Apr
    expect(quarters[2].start.getMonth()).toBe(6); // Jul
    expect(quarters[3].start.getMonth()).toBe(9); // Oct
  });

  it("divides a year into 2-week chunks", () => {
    const year = period(adapter, new Date(2024, 0, 1), "year");
    const biweekly = divide(adapter, year, "week", 2);

    expect(biweekly.length).toBeGreaterThanOrEqual(26);
    expect(biweekly.length).toBeLessThanOrEqual(27);
  });

  it("slots are contiguous (no gaps)", () => {
    const hour = period(adapter, new Date(2024, 0, 1, 10), "hour");
    const slots = divide(adapter, hour, "minute", 15);

    for (let i = 1; i < slots.length; i++) {
      expect(slots[i].start.getTime()).toBe(slots[i - 1].end.getTime() + 1);
    }
  });

  it("slots have type custom when count > 1", () => {
    const hour = period(adapter, new Date(2024, 0, 1, 10), "hour");
    const slots = divide(adapter, hour, "minute", 15);

    slots.forEach((slot) => {
      expect(slot.type).toBe("custom");
    });
  });

  it("count=1 behaves like original divide", () => {
    const year = period(adapter, new Date(2024, 0, 1), "year");
    const months = divide(adapter, year, "month", 1);

    expect(months).toHaveLength(12);
    expect(months[0].type).toBe("month");
  });

  it("divides an hour into 20-minute slots (uneven)", () => {
    const hour = period(adapter, new Date(2024, 0, 1, 10), "hour");
    const slots = divide(adapter, hour, "minute", 20);

    expect(slots).toHaveLength(3);
    expect(slots[0].start.getMinutes()).toBe(0);
    expect(slots[1].start.getMinutes()).toBe(20);
    expect(slots[2].start.getMinutes()).toBe(40);
  });
});
