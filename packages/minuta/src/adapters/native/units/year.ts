import type { UnitHandler } from "../../../types";

/**
 * Year unit handler - pure functional implementation
 */
export const yearHandler: UnitHandler = {
  startOf: (date: Date): Date => {
    return new Date(date.getFullYear(), 0, 1, 0, 0, 0, 0);
  },

  endOf: (date: Date): Date => {
    return new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999);
  },

  add: (date: Date, amount: number): Date => {
    const d = new Date(date);
    const originalDay = d.getDate();

    // Set to day 1 first to prevent month overflow during setFullYear
    // (e.g. Feb 29 in a leap year → Mar 1 in a non-leap year)
    d.setDate(1);
    d.setFullYear(d.getFullYear() + amount);

    // Restore original day, clamped to last day of the target month
    const lastDayOfMonth = new Date(
      d.getFullYear(),
      d.getMonth() + 1,
      0
    ).getDate();
    d.setDate(Math.min(originalDay, lastDayOfMonth));

    return d;
  },

  diff: (from: Date, to: Date): number => {
    return to.getFullYear() - from.getFullYear();
  },
};
