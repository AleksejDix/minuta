import { describe, expect, it } from "vitest";
import { snap } from "./snap";

const FIVE_MINUTES_MS = 300_000;
const QUARTER_HOUR_MS = 900_000;
const HALF_HOUR_MS = 1_800_000;
const HOUR_MS = 3_600_000;

describe("snap() nearest (default)", () => {
  it("snaps to nearest 15min boundary", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const result = snap(new Date("2024-03-15T10:37:00Z"), QUARTER_HOUR_MS);
    expect(result).toStrictEqual(new Date("2024-03-15T10:30:00Z"));
  });

  it("snaps up when closer to next boundary", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const result = snap(new Date("2024-03-15T10:38:00Z"), QUARTER_HOUR_MS);
    expect(result).toStrictEqual(new Date("2024-03-15T10:45:00Z"));
  });

  it("already on boundary", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const result = snap(new Date("2024-03-15T10:00:00Z"), QUARTER_HOUR_MS);
    expect(result).toStrictEqual(new Date("2024-03-15T10:00:00Z"));
  });

  it("snaps to nearest 30min", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const result = snap(new Date("2024-03-15T10:37:00Z"), HALF_HOUR_MS);
    expect(result).toStrictEqual(new Date("2024-03-15T10:30:00Z"));
  });

  it("snaps to nearest 5min", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const result = snap(new Date("2024-03-15T14:02:00Z"), FIVE_MINUTES_MS);
    expect(result).toStrictEqual(new Date("2024-03-15T14:00:00Z"));
  });

  it("snaps across midnight", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const result = snap(new Date("2024-03-15T23:53:00Z"), QUARTER_HOUR_MS);
    expect(result).toStrictEqual(new Date("2024-03-16T00:00:00Z"));
  });
});

describe("snap() floor", () => {
  it("always snaps to earlier boundary", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const result = snap(
      new Date("2024-03-15T10:37:00Z"),
      QUARTER_HOUR_MS,
      "floor"
    );
    expect(result).toStrictEqual(new Date("2024-03-15T10:30:00Z"));
  });

  it("stays on boundary", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const result = snap(
      new Date("2024-03-15T10:45:00Z"),
      QUARTER_HOUR_MS,
      "floor"
    );
    expect(result).toStrictEqual(new Date("2024-03-15T10:45:00Z"));
  });

  it("floors to 30min", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const result = snap(
      new Date("2024-03-15T10:59:00Z"),
      HALF_HOUR_MS,
      "floor"
    );
    expect(result).toStrictEqual(new Date("2024-03-15T10:30:00Z"));
  });
});

describe("snap() ceil", () => {
  it("always snaps to later boundary", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const result = snap(
      new Date("2024-03-15T10:31:00Z"),
      QUARTER_HOUR_MS,
      "ceil"
    );
    expect(result).toStrictEqual(new Date("2024-03-15T10:45:00Z"));
  });

  it("stays on boundary", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const result = snap(
      new Date("2024-03-15T10:30:00Z"),
      QUARTER_HOUR_MS,
      "ceil"
    );
    expect(result).toStrictEqual(new Date("2024-03-15T10:30:00Z"));
  });

  it("ceils across midnight", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const result = snap(
      new Date("2024-03-15T23:46:00Z"),
      QUARTER_HOUR_MS,
      "ceil"
    );
    expect(result).toStrictEqual(new Date("2024-03-16T00:00:00Z"));
  });
});

describe("snap() 1-hour intervals", () => {
  it("snaps to nearest hour", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const result = snap(new Date("2024-03-15T10:29:00Z"), HOUR_MS);
    expect(result).toStrictEqual(new Date("2024-03-15T10:00:00Z"));
  });

  it("snaps up past half hour", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const result = snap(new Date("2024-03-15T10:31:00Z"), HOUR_MS);
    expect(result).toStrictEqual(new Date("2024-03-15T11:00:00Z"));
  });
});
