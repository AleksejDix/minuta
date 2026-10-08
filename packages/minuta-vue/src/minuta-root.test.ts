import { describe, expect, it } from "vitest";
import { h, nextTick, shallowRef } from "vue";
import { itemAt, mountRender, probeInRoot, recorder } from "./test/mount";
import { MinutaRoot } from "#src/index";
import type { MinutaState } from "./types";
import { nativeUnits } from "minuta/native";
import { useMinuta } from "./use-minuta";
import { useMinutaContext } from "./minuta-context";

const SUNDAY = 0;
const MONDAY = 1;
const MARCH = 2;
const FIRST = 0;
const SECOND = 1;
const OUTSIDE_ROOT = "useMinutaContext() must be used within <MinutaRoot>";

const testDate = new Date("2024-03-13T00:00:00");

describe("useMinutaContext()", () => {
  it("returns the state of the nearest MinutaRoot", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { result } = probeInRoot(useMinutaContext, { date: testDate });

    expect(result.browsing.value.start).toStrictEqual(
      new Date("2024-03-01T00:00:00")
    );
    expect(result.period(testDate, "week").start.getDay()).toBe(MONDAY);
  });

  it("shares one state between all parts", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const part = recorder(useMinutaContext);
    mountRender(() =>
      h(
        MinutaRoot,
        { date: testDate },
        { default: () => [h(part.component), h(part.component)] }
      )
    );

    expect(itemAt(part.results, FIRST)).toBe(itemAt(part.results, SECOND));
  });

  it("throws outside MinutaRoot", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const orphan = recorder(useMinutaContext);

    expect(() => mountRender(() => h(orphan.component))).toThrow(OUTSIDE_ROOT);
  });

  it("throws outside any component", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(() => useMinutaContext()).toThrow(OUTSIDE_ROOT);
  });
});

describe("minutaRoot", () => {
  it("passes its props to useMinuta()", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const options = {
      date: testDate,
      unit: "week",
      units: nativeUnits({ weekStartsOn: SUNDAY }),
    } as const;
    const { result } = probeInRoot(useMinutaContext, options);

    expect(result.browsing.value).toStrictEqual(
      useMinuta(options).browsing.value
    );
    expect(result.browsing.value.start.getDay()).toBe(SUNDAY);
  });

  it("follows prop changes", { timeout: 5000 }, async () => {
    expect.hasAssertions();
    const units = shallowRef(nativeUnits({ weekStartsOn: MONDAY }));
    const part = recorder(useMinutaContext);
    mountRender(() =>
      h(
        MinutaRoot,
        { date: testDate, unit: "week", units: units.value },
        { default: () => h(part.component) }
      )
    );
    const state = itemAt(part.results, FIRST);
    expect(state.browsing.value.start.getDay()).toBe(MONDAY);

    units.value = nativeUnits({ weekStartsOn: SUNDAY });
    await nextTick();

    expect(state.browsing.value.start.getDay()).toBe(SUNDAY);
    expect(state.browsing.value.start.getMonth()).toBe(MARCH);
  });
});

describe("minutaRoot slot", () => {
  it("exposes the state through its default slot", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { element } = mountRender(() =>
      h(
        MinutaRoot,
        { date: testDate },
        {
          default: ({ minuta }: Readonly<{ minuta: MinutaState }>) =>
            minuta.browsing.value.start.toDateString(),
        }
      )
    );

    expect(element.textContent).toBe(
      new Date("2024-03-01T00:00:00").toDateString()
    );
  });
});
