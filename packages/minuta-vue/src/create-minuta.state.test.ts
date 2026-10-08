import { describe, expect, it } from "vitest";
import { effect, ref } from "vue";
import type { Period } from "minuta";
import { createMinuta } from "./create-minuta";
import { createNativeAdapter } from "minuta/native";

const ONE_RUN = 1;
const TWO_RUNS = 2;

const mockAdapter = createNativeAdapter();
const testDate = new Date("2024-01-15T12:30:45");

describe("createMinuta() reactive date handling", () => {
  it(
    "should accept ref date and preserve reactivity",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const dateRef = ref(testDate);
      const minuta = createMinuta({
        adapter: mockAdapter,
        date: dateRef,
      });

      expect(minuta.browsing.value.start).toStrictEqual(testDate);

      // Update ref
      dateRef.value = new Date("2024-02-01T00:00:00");
      // Browsing is its own ref
      expect(minuta.browsing.value.start).toStrictEqual(testDate);
    }
  );

  it("should accept ref now and preserve reactivity", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const nowRef = ref(new Date("2024-01-20T00:00:00"));
    const minuta = createMinuta({
      adapter: mockAdapter,
      date: ref(testDate),
      now: nowRef,
    });

    expect(minuta.now.value.start).toStrictEqual(nowRef.value);

    // Verify reactivity
    const runs: Period[] = [];
    effect(() => {
      runs.push(minuta.now.value);
    });

    expect(runs).toHaveLength(ONE_RUN);

    // Update ref
    nowRef.value = new Date("2024-01-21T00:00:00");
    expect(runs).toHaveLength(TWO_RUNS);
    expect(minuta.now.value.start).toStrictEqual(nowRef.value);
  });
});

describe("createMinuta() period initialization", () => {
  it("should initialize browsing period correctly", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const minuta = createMinuta({
      adapter: mockAdapter,
      date: ref(testDate),
    });

    const browsing = minuta.browsing.value;
    expect(browsing.start).toStrictEqual(testDate);
    expect(browsing.end).toStrictEqual(testDate);
    expect(browsing.type).toBe("day");
    expect(browsing.start).toStrictEqual(testDate);
  });

  it("should initialize now period as computed", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const nowDate = new Date("2024-01-20T15:30:45");
    const minuta = createMinuta({
      adapter: mockAdapter,
      date: ref(testDate),
      now: ref(nowDate),
    });

    const now = minuta.now.value;
    expect(now.start).toStrictEqual(nowDate);
    expect(now.end).toStrictEqual(nowDate);
    expect(now.type).toBe("second");
    expect(now.start).toStrictEqual(nowDate);
  });
});
