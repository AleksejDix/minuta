import { describe, expect, it } from "vitest";
import { get, writable } from "svelte/store";
import { createNativeAdapter } from "@allystudio/usetemporal/native";
import { createTemporal } from "./createTemporal";
import { usePeriod } from "./usePeriod";

const adapter = createNativeAdapter({ weekStartsOn: 1 });

describe("createTemporal", () => {
  it("creates a builder wired to writable stores", () => {
    const date = writable(new Date("2024-05-01T00:00:00.000Z"));
    const temporal = createTemporal({ adapter, date, locale: "de" });

    expect(temporal.locale).toBe("de");
    expect(get(temporal.browsing).type).toBe("day");

    const nextDay = temporal.next(get(temporal.browsing));
    expect(nextDay.start.getUTCDate()).toBe(2);
    expect(get(temporal.browsing).start.toISOString()).toBe(
      nextDay.start.toISOString()
    );

    const month = usePeriod(temporal, "month");
    expect(get(month).type).toBe("month");
  });

  it("supports reactive units via stores", () => {
    const date = writable(new Date("2024-05-01T00:00:00.000Z"));
    const unit = writable<"month" | "week">("month");
    const temporal = createTemporal({ adapter, date });

    const period = usePeriod(temporal, unit);
    expect(get(period).type).toBe("month");

    unit.set("week");
    expect(get(period).type).toBe("week");
  });

  it("throws when adapter missing", () => {
    // @ts-expect-error verifying runtime guard
    expect(() => createTemporal({ date: writable(new Date()) })).toThrow(
      /adapter is required/
    );
  });
});
