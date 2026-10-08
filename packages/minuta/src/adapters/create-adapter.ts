import type { Adapter, AdapterUnit, UnitHandler } from "#src/types";

/**
 * Create an Adapter from a handlers map.
 * Shared by all adapter implementations.
 *
 * @param handlers - One handler per adapter unit
 * @returns An adapter dispatching each call to the handler of the given unit
 */
function createAdapter(
  handlers: Readonly<Record<AdapterUnit, UnitHandler>>
): Adapter {
  return {
    add: (date: Readonly<Date>, amount: number, unit: AdapterUnit): Date =>
      handlers[unit].add(date, amount),
    diff: (
      from: Readonly<Date>,
      to: Readonly<Date>,
      unit: AdapterUnit
    ): number => handlers[unit].diff(from, to),
    endOf: (date: Readonly<Date>, unit: AdapterUnit): Date =>
      handlers[unit].endOf(date),
    startOf: (date: Readonly<Date>, unit: AdapterUnit): Date =>
      handlers[unit].startOf(date),
  };
}

export { createAdapter };
