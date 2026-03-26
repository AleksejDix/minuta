import type { UnitHandler } from "../../../types";
import { plainDateToLocal } from "../toLocalDate";

export const yearHandler: UnitHandler = {
  startOf(date: Date): Date {
    const result = new Date(date.getFullYear(), 0, 1, 0, 0, 0, 0);
    return result;
  },

  endOf(date: Date): Date {
    const temporal = (globalThis as any).Temporal;
    const plainDate = temporal.PlainDate.from({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
    });
    const endOfYear = plainDate.with({ month: 12, day: 31 });
    const endDate = plainDateToLocal(endOfYear, 23, 59, 59, 999);
    return endDate;
  },

  add(date: Date, amount: number): Date {
    const temporal = (globalThis as any).Temporal;
    const plainDate = temporal.PlainDate.from({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
    });
    const result = plainDate.add({ years: amount });
    return plainDateToLocal(
      result,
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
      date.getMilliseconds()
    );
  },

  diff(from: Date, to: Date): number {
    const temporal = (globalThis as any).Temporal;
    const fromPlain = temporal.PlainDate.from({
      year: from.getFullYear(),
      month: from.getMonth() + 1,
      day: from.getDate(),
    });
    const toPlain = temporal.PlainDate.from({
      year: to.getFullYear(),
      month: to.getMonth() + 1,
      day: to.getDate(),
    });
    const duration = fromPlain.until(toPlain, { largestUnit: "year" });
    return duration.years;
  },
};
