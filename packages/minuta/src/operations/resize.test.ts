import { describe, expect, it } from "vitest";
import { createPeriod } from "./period";
import { resize } from "./resize";

const meeting = createPeriod(
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
      type: "custom",
    });
  });

  it("moves start earlier", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(
      resize(meeting, "start", new Date("2024-01-01T08:00:00"))
    ).toStrictEqual({
      end: new Date("2024-01-01T10:00:00"),
      start: new Date("2024-01-01T08:00:00"),
      type: "custom",
    });
  });

  it("shrinks from end", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(
      resize(meeting, "end", new Date("2024-01-01T09:30:00"))
    ).toStrictEqual({
      end: new Date("2024-01-01T09:30:00"),
      start: new Date("2024-01-01T09:00:00"),
      type: "custom",
    });
  });

  it("shrinks from start", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(
      resize(meeting, "start", new Date("2024-01-01T09:45:00"))
    ).toStrictEqual({
      end: new Date("2024-01-01T10:00:00"),
      start: new Date("2024-01-01T09:45:00"),
      type: "custom",
    });
  });
});

describe("resize() edge cases", () => {
  it("returns null when edges cross", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(
      resize(meeting, "start", new Date("2024-01-01T11:00:00"))
    ).toBeNull();
    expect(resize(meeting, "end", new Date("2024-01-01T08:00:00"))).toBeNull();
  });

  it("allows zero-width result", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(
      resize(meeting, "end", new Date("2024-01-01T09:00:00"))
    ).toStrictEqual({
      end: new Date("2024-01-01T09:00:00"),
      start: new Date("2024-01-01T09:00:00"),
      type: "custom",
    });
  });

  it("returns type custom", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(
      resize(meeting, "end", new Date("2024-01-01T11:00:00"))
    ).toHaveProperty("type", "custom");
  });
});
