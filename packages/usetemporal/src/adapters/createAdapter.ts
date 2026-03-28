import type { Adapter, AdapterUnit, UnitHandler } from "../../types";

/**
 * Create an Adapter from a handlers map.
 * Shared by all adapter implementations.
 */
export function createAdapter(
  handlers: Record<AdapterUnit, UnitHandler>
): Adapter {
  return {
    startOf: (date: Date, unit: AdapterUnit): Date => {
      return handlers[unit].startOf(date);
    },
    endOf: (date: Date, unit: AdapterUnit): Date => {
      return handlers[unit].endOf(date);
    },
    add: (date: Date, amount: number, unit: AdapterUnit): Date => {
      return handlers[unit].add(date, amount);
    },
    diff: (from: Date, to: Date, unit: AdapterUnit): number => {
      return handlers[unit].diff(from, to);
    },
  };
}
