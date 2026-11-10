import { describe, expect, it } from "vitest";
import { h, nextTick, shallowRef } from "vue";
import {
  itemAt,
  mountRender,
  probeInRoot,
  recorder,
  silenceVueWarnings,
} from "./test/mount";
import { MinutaRoot } from "#src/index";
import type { MinutaState } from "./types";
import { createUnits } from "@aleksejdix/minuta";
import { date } from "#src/test/temporal";
import { useMinuta } from "./use-minuta";
import { useMinutaContext } from "./minuta-context";

const MONTH_OFFSET = 1;
const WEEK_LENGTH = 7;

const SUNDAY = 0;
const MONDAY = 1;
const MARCH = 2;
const FIRST = 0;
const SECOND = 1;
const OUTSIDE_ROOT = "useMinutaContext() must be used within <MinutaRoot>";

const testDate = date("2024-03-13");

describe("useMinutaContext()", () => {
  it("returns the state of the nearest MinutaRoot", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { result } = probeInRoot(useMinutaContext, { date: testDate });

    expect(result.browsing.value.start).toStrictEqual(date("2024-03-01"));
    expect(result.week(testDate).start.dayOfWeek % WEEK_LENGTH).toBe(MONDAY);
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
    const warn = silenceVueWarnings();
    const orphan = recorder(useMinutaContext);

    expect(() => mountRender(() => h(orphan.component))).toThrow(OUTSIDE_ROOT);
    expect(warn.mock.calls.flat()).toContainEqual(
      expect.stringContaining("[Vue warn]")
    );
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
      units: createUnits({ weekStartsOn: SUNDAY }),
    } as const;
    const { result } = probeInRoot(useMinutaContext, options);

    expect(result.browsing.value).toStrictEqual(
      useMinuta(options).browsing.value
    );
    expect(result.browsing.value.start.dayOfWeek % WEEK_LENGTH).toBe(SUNDAY);
  });

  it("follows prop changes", { timeout: 5000 }, async () => {
    expect.hasAssertions();
    const units = shallowRef(createUnits({ weekStartsOn: MONDAY }));
    const part = recorder(useMinutaContext);
    mountRender(() =>
      h(
        MinutaRoot,
        { date: testDate, unit: "week", units: units.value },
        { default: () => h(part.component) }
      )
    );
    const state = itemAt(part.results, FIRST);
    expect(state.browsing.value.start.dayOfWeek % WEEK_LENGTH).toBe(MONDAY);

    units.value = createUnits({ weekStartsOn: SUNDAY });
    await nextTick();

    expect(state.browsing.value.start.dayOfWeek % WEEK_LENGTH).toBe(SUNDAY);
    expect(state.browsing.value.start.month - MONTH_OFFSET).toBe(MARCH);
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
            minuta.browsing.value.start.toString(),
        }
      )
    );

    expect(element.textContent).toBe(date("2024-03-01").toString());
  });
});
