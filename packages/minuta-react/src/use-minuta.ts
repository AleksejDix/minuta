import type { MinutaOptions, MinutaState } from "./types";
import type { Period, Units } from "minuta/core";
import { useCallback, useMemo, useState } from "react";
import { nativeUnits } from "minuta/native";
import { useClock } from "./use-clock";
import { withUnits } from "minuta/core";

const DEFAULT_UNITS: Units = nativeUnits();

function currentDate(): Date {
  return new Date();
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
  const [browsedDate, setBrowsedDate] = useState<Readonly<Date>>(
    date ?? currentDate
  );
  const ops = useMemo(() => withUnits(units), [units]);
  const clock = useClock(ops, nowOption !== undefined);
  const nowDate = nowOption ?? clock;
  const browsing = useMemo(
    () => ops.period(browsedDate, unit),
    [ops, browsedDate, unit]
  );
  const now = useMemo(() => ops.period(nowDate, "second"), [ops, nowDate]);
  const browse = useCallback((period: Period) => {
    setBrowsedDate(period.start);
  }, []);

  return useMemo(() => {
    const state = { browse, browsing, now };
    return Object.assign(state, ops);
  }, [browse, browsing, now, ops]);
}

export { useMinuta };
