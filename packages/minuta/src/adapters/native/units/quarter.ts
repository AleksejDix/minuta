import type { UnitHandler } from "../../../types";

/**
 * Quarter unit handler - pure functional implementation
 */
export const quarterHandler: UnitHandler = {
  startOf: (date: Date): Date => {
    const month = date.getMonth();
    const quarterStartMonth = Math.floor(month / 3) * 3;
    return new Date(date.getFullYear(), quarterStartMonth, 1, 0, 0, 0, 0);
  },

  endOf: (date: Date): Date => {
    const month = date.getMonth();
    const quarterStartMonth = Math.floor(month / 3) * 3;
    const quarterEndMonth = quarterStartMonth + 2;
    // Get last day of quarter by going to next month's day 0
    return new Date(
      date.getFullYear(),
      quarterEndMonth + 1,
      0,
      23,
      59,
      59,
      999
    );
  },

  add: (date: Date, amount: number): Date => {
    const d = new Date(date);
    const originalDay = d.getDate();

    // Set to day 1 first to prevent month overflow
    // (e.g. Jan 31 + 1 quarter → Apr 31 → May 1)
    d.setDate(1);
    d.setMonth(d.getMonth() + amount * 3);

    // Restore original day, clamped to last day of target month
    const lastDayOfMonth = new Date(
      d.getFullYear(),
      d.getMonth() + 1,
      0
    ).getDate();
    d.setDate(Math.min(originalDay, lastDayOfMonth));

    return d;
  },

  diff: (from: Date, to: Date): number => {
    const fromQuarter = Math.floor(from.getMonth() / 3);
    const toQuarter = Math.floor(to.getMonth() / 3);
    const yearDiff = to.getFullYear() - from.getFullYear();
    return yearDiff * 4 + (toQuarter - fromQuarter);
  },
};
