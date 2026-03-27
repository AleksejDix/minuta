import type { Period, Adapter } from "../types";

/**
 * A navigator function that knows how to recreate a derived period type
 * after navigation (next/previous/go). Unlike shiftCustomPeriod which
 * shifts by duration, navigators can reconstruct periods properly
 * (e.g., recalculating grid boundaries for stableMonth).
 */
export type PeriodNavigator = (
  adapter: Adapter,
  p: Period,
  steps: number
) => Period;

const registry = new Map<string, PeriodNavigator>();

/**
 * Register a navigation function for a derived period type.
 * Called as a side-effect when importing calendar modules.
 */
export function registerPeriodNavigator(
  type: string,
  navigator: PeriodNavigator
): void {
  registry.set(type, navigator);
}

/**
 * Look up a registered navigator for a period type.
 * Returns undefined if no navigator is registered (falls back to shiftCustomPeriod).
 */
export function getPeriodNavigator(type: string): PeriodNavigator | undefined {
  return registry.get(type);
}
