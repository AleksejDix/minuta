import { describe, it, expect } from "vitest";
import { resize } from "./resize";
import { createPeriod } from "./period";

describe("resize", () => {
  const meeting = createPeriod(
    new Date(2024, 0, 1, 9, 0),
    new Date(2024, 0, 1, 10, 0)
  );

  it("extends end", () => {
    const result = resize(meeting, "end", new Date(2024, 0, 1, 11, 30))!;
    expect(result.start).toEqual(new Date(2024, 0, 1, 9, 0));
    expect(result.end).toEqual(new Date(2024, 0, 1, 11, 30));
  });

  it("moves start earlier", () => {
    const result = resize(meeting, "start", new Date(2024, 0, 1, 8, 0))!;
    expect(result.start).toEqual(new Date(2024, 0, 1, 8, 0));
    expect(result.end).toEqual(new Date(2024, 0, 1, 10, 0));
  });

  it("shrinks from end", () => {
    const result = resize(meeting, "end", new Date(2024, 0, 1, 9, 30))!;
    expect(result.start).toEqual(new Date(2024, 0, 1, 9, 0));
    expect(result.end).toEqual(new Date(2024, 0, 1, 9, 30));
  });

  it("shrinks from start", () => {
    const result = resize(meeting, "start", new Date(2024, 0, 1, 9, 45))!;
    expect(result.start).toEqual(new Date(2024, 0, 1, 9, 45));
    expect(result.end).toEqual(new Date(2024, 0, 1, 10, 0));
  });

  it("returns null when edges cross", () => {
    expect(resize(meeting, "start", new Date(2024, 0, 1, 11, 0))).toBeNull();
    expect(resize(meeting, "end", new Date(2024, 0, 1, 8, 0))).toBeNull();
  });

  it("allows zero-width result", () => {
    const result = resize(meeting, "end", new Date(2024, 0, 1, 9, 0))!;
    expect(result.start.getTime()).toBe(result.end.getTime());
  });

  it("returns type custom", () => {
    expect(resize(meeting, "end", new Date(2024, 0, 1, 11, 0))!.type).toBe(
      "custom"
    );
  });
});
