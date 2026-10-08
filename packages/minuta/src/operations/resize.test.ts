import { describe, expect, it } from "vitest";
import { range } from "./period";
import { resize } from "./resize";

const meeting = range(
  new Date("2024-01-01T09:00:00"),
  new Date("2024-01-01T10:00:00")
);

describe("resize() growing and shrinking", () => {
  it("extends end", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(
      resize(meeting, "end", new Date("2024-01-01T11:30:00"))
    ).toStrictEqual({
      end: new Date("2024-01-01T11:30:00"),
      start: new Date("2024-01-01T09:00:00"),
      unit: "custom",
    });
  });

  it("moves start earlier", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(
      resize(meeting, "start", new Date("2024-01-01T08:00:00"))
    ).toStrictEqual({
      end: new Date("2024-01-01T10:00:00"),
      start: new Date("2024-01-01T08:00:00"),
      unit: "custom",
    });
  });

  it("shrinks from end", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(
      resize(meeting, "end", new Date("2024-01-01T09:30:00"))
    ).toStrictEqual({
      end: new Date("2024-01-01T09:30:00"),
      start: new Date("2024-01-01T09:00:00"),
      unit: "custom",
    });
  });

  it("shrinks from start", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(
      resize(meeting, "start", new Date("2024-01-01T09:45:00"))
    ).toStrictEqual({
      end: new Date("2024-01-01T10:00:00"),
      start: new Date("2024-01-01T09:45:00"),
      unit: "custom",
    });
  });
});

describe("resize() edge cases", () => {
  it("returns undefined when edges cross", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(
      resize(meeting, "start", new Date("2024-01-01T11:00:00"))
    ).toBeUndefined();
    expect(
      resize(meeting, "end", new Date("2024-01-01T08:00:00"))
    ).toBeUndefined();
  });

  it("allows zero-width result", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(
      resize(meeting, "end", new Date("2024-01-01T09:00:00"))
    ).toStrictEqual({
      end: new Date("2024-01-01T09:00:00"),
      start: new Date("2024-01-01T09:00:00"),
      unit: "custom",
    });
  });

  it("returns unit custom", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(
      resize(meeting, "end", new Date("2024-01-01T11:00:00"))
    ).toHaveProperty("unit", "custom");
  });
});
