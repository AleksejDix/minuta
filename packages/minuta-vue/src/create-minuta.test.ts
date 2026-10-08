import { describe, expect, it } from "vitest";
import { isRef, ref } from "vue";
import type { MinutaBuilder } from "./types";
import { createMinuta } from "./create-minuta";
import { createNativeAdapter } from "minuta/native";

const DAYS_PER_WEEK = 7;
const MONDAY = 1;
const WEEK_DAY_INDEXES = Array.from(
  { length: DAYS_PER_WEEK },
  (_value, index) => index
);

const mockAdapter = createNativeAdapter();
const testDate = new Date("2024-01-15T12:30:45");

/**
 * Calls createMinuta the way an untyped JavaScript caller could.
 *
 * @param options - Options that may violate CreateMinutaOptions
 * @returns Whatever createMinuta returns
 */
function createMinutaUnchecked(options: object): MinutaBuilder {
  // @ts-expect-error -- Simulates a JavaScript caller passing invalid options
  return createMinuta(options);
}

describe("createMinuta() validation", () => {
  it(
    "should throw error when adapter is not provided",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const options = {
        date: ref(testDate),
      };

      expect(() => createMinutaUnchecked(options)).toThrow(
        "A date adapter is required. Please install and provide an adapter from minuta/* packages."
      );
    }
  );

  it("should throw error when adapter is null", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const options = {
      // oxlint-disable-next-line unicorn/no-null -- The test covers callers passing null
      adapter: null,
      date: ref(testDate),
    };

    expect(() => createMinutaUnchecked(options)).toThrow(
      "A date adapter is required"
    );
  });

  it("should throw error when adapter is undefined", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const options = {
      adapter: undefined,
      date: ref(testDate),
    };

    expect(() => createMinutaUnchecked(options)).toThrow(
      "A date adapter is required"
    );
  });
});

describe("createMinuta() defaults", () => {
  it("should create minuta with required options", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const minuta = createMinuta({
      adapter: mockAdapter,
      date: ref(testDate),
    });

    expect(minuta).toBeDefined();
    expect(minuta.adapter).toBe(mockAdapter);
    // Default Monday
    expect(minuta.weekStartsOn).toBe(MONDAY);
    expect(isRef(minuta.browsing)).toBe(true);
    expect(isRef(minuta.now)).toBe(true);
  });

  it("should default locale to en", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const minuta = createMinuta({
      adapter: mockAdapter,
      date: ref(testDate),
    });
    expect(minuta.locale).toBe("en");
  });

  it(
    "should default now to current date when not provided",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const beforeCreate = new Date();
      const minuta = createMinuta({
        adapter: mockAdapter,
        date: ref(testDate),
      });
      const afterCreate = new Date();

      const nowTime = minuta.now.value.start.getTime();
      expect(nowTime).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(nowTime).toBeLessThanOrEqual(afterCreate.getTime());
    }
  );
});

describe("createMinuta() options", () => {
  it("should accept custom weekStartsOn values", { timeout: 5000 }, () => {
    expect.hasAssertions();
    for (const day of WEEK_DAY_INDEXES) {
      const minuta = createMinuta({
        adapter: mockAdapter,
        date: ref(testDate),
        weekStartsOn: day,
      });
      expect(minuta.weekStartsOn).toBe(day);
    }
  });

  it("should accept custom locale", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const minuta = createMinuta({
      adapter: mockAdapter,
      date: ref(testDate),
      locale: "zh-CN",
    });
    expect(minuta.locale).toBe("zh-CN");
  });

  it("should use provided now date", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const nowDate = new Date("2024-01-20T10:00:00");
    const minuta = createMinuta({
      adapter: mockAdapter,
      date: ref(testDate),
      now: ref(nowDate),
    });

    expect(minuta.now.value.start).toStrictEqual(nowDate);
  });

  it("should handle weekStartsOn as undefined", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const minuta = createMinutaUnchecked({
      adapter: mockAdapter,
      date: ref(testDate),
      weekStartsOn: undefined,
    });

    // Default Monday
    expect(minuta.weekStartsOn).toBe(MONDAY);
  });
});
