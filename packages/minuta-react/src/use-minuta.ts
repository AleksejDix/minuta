import type { MinutaOptions, MinutaState } from "./types";
import type { Period, TimeValue, Units } from "@aleksejdix/minuta";
import { createUnits, withUnits } from "@aleksejdix/minuta";
import { useCallback, useMemo, useState } from "react";
import { currentMoment } from "./now";
import { useClock } from "./use-clock";

const DEFAULT_UNITS: Units = createUnits();

// The units' zone, else the runtime's
function timeZoneOf(units: Units): string {
  return units.timeZone ?? new Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Reactive minuta state: every operation bound to `units` (memoised on
 * `units`), the browsed period and the period of "now".
 *
 * @example
 * const minuta = useMinuta({ unit: "month" });
 * minuta.browse(minuta.next(minuta.browsing));
 *
 * @param options - Units, initially browsed date, now and browsing unit
 * @returns The bound operations with `units`, `browsing`, `now` and `browse`
 */
function useMinuta(options: MinutaOptions = {}): MinutaState {
  const {
    date,
    now: nowOption,
    unit = "month",
    units = DEFAULT_UNITS,
  } = options;
  const [browsedDate, setBrowsedDate] = useState<TimeValue>(
    () => date ?? currentMoment(timeZoneOf(units))
  );
  const ops = useMemo(() => withUnits(units), [units]);
  const clock = useClock(ops, nowOption !== undefined);
  const nowDate = nowOption ?? clock;
  const browsing = useMemo(
    () => ops[unit](browsedDate),
    [ops, browsedDate, unit]
  );
  const now = useMemo(() => ops.second(nowDate), [ops, nowDate]);
  const browse = useCallback((period: Period) => {
    setBrowsedDate(period.start);
  }, []);

  return useMemo(() => {
    const state = { browse, browsing, now };
    return Object.assign(state, ops);
  }, [browse, browsing, now, ops]);
}

export { useMinuta };
