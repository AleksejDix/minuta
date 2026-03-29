import { describe, expect, it } from "vitest";
import { get, writable } from "svelte/store";
import { createNativeAdapter } from "minuta/native";
import { createMinuta } from "./createMinuta";
import { usePeriod } from "./usePeriod";

const adapter = createNativeAdapter({ weekStartsOn: 1 });

describe("createMinuta", () => {
  it("creates a builder wired to writable stores", () => {
    const date = writable(new Date("2024-05-01T00:00:00.000Z"));
    const minuta = createMinuta({ adapter, date, locale: "de" });

    expect(minuta.locale).toBe("de");
    expect(get(minuta.browsing).type).toBe("day");

    const nextDay = minuta.next(get(minuta.browsing));
    expect(nextDay.start.getUTCDate()).toBe(2);
    expect(get(minuta.browsing).start.toISOString()).toBe(
      nextDay.start.toISOString()
    );

    const month = usePeriod(minuta, "month");
    expect(get(month).type).toBe("month");
  });

  it("supports reactive units via stores", () => {
    const date = writable(new Date("2024-05-01T00:00:00.000Z"));
    const unit = writable<"month" | "week">("month");
    const minuta = createMinuta({ adapter, date });

    const period = usePeriod(minuta, unit);
    expect(get(period).type).toBe("month");

    unit.set("week");
    expect(get(period).type).toBe("week");
  });

  it("throws when adapter missing", () => {
    // @ts-expect-error verifying runtime guard
    expect(() => createMinuta({ date: writable(new Date()) })).toThrow(
      /adapter is required/
    );
  });
});
