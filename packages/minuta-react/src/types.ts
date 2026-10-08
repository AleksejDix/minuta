import type { Minuta, Period, Unit, Units } from "minuta/core";

/**
 * Options of `useMinuta()` and the props of `MinutaRoot`.
 */
type MinutaOptions = Readonly<{
  /** Initially browsed date, default: now */
  date?: Readonly<Date> | undefined;
  /** The moment that counts as "now", default: `new Date()` */
  now?: Readonly<Date> | undefined;
  /** Unit of the browsed period, default: `"month"` */
  unit?: Unit | undefined;
  /** Unit specs, default: `nativeUnits()` (weeks start on Monday) */
  units?: Units | undefined;
}>;

/**
 * What `useMinuta()` returns and `MinutaRoot` provides: every operation of
 * `withUnits(units)` plus the browsing state.
 */
type MinutaState = Minuta &
  Readonly<{
    /** Browse to the period of the browsing unit containing `period.start` */
    browse: (period: Period) => void;
    /** The browsed period */
    browsing: Period;
    /** The second containing the `now` date */
    now: Period;
    /** The units every operation is bound to */
    units: Units;
  }>;

export type { MinutaOptions, MinutaState };
export type { Minuta, Period, Unit, Units } from "minuta/core";
