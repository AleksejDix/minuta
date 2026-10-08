import { describe, expect, it } from "vitest";
import { periodWith, range } from "./period";
import { MinutaError } from "#src/units";
import { nativeUnits } from "#src/adapters/native/index";

const units = nativeUnits();

describe("range() rejects invalid input", () => {
  it("throws on invalid dates", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(() => range(new Date("invalid"), new Date("also-invalid"))).toThrow(
      RangeError
    );
    expect(() => range(new Date("invalid"), new Date("also-invalid"))).toThrow(
      MinutaError.InvalidDate
    );
  });

  it("swaps a reversed period (start > end)", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(
      range(new Date("2024-06-15T00:00:00"), new Date("2024-01-01T00:00:00"))
    ).toStrictEqual({
      end: new Date("2024-06-15T00:00:00"),
      start: new Date("2024-01-01T00:00:00"),
      unit: "custom",
    });
  });

  it("accepts zero-duration period (start === end)", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(() =>
      range(new Date("2024-01-01T00:00:00"), new Date("2024-01-01T00:00:00"))
    ).not.toThrow();
  });
});

describe("periodWith() always produces valid periods", () => {
  it("produces valid period from any date", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const month = periodWith(units, new Date("2024-01-15T00:00:00"), "month");
    expect(month.start.getTime()).toBeLessThanOrEqual(month.end.getTime());
    expect(Number.isNaN(month.start.getTime())).toBe(false);
  });

  it("throws on an invalid date", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(() => periodWith(units, new Date("invalid"), "month")).toThrow(
      RangeError
    );
    expect(() => periodWith(units, new Date("invalid"), "month")).toThrow(
      MinutaError.InvalidDate
    );
  });
});
