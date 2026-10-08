import type { ReadonlyPeriod } from "#src/types";

/**
 * Validate that a period has valid dates and start <= end.
 * Only used at entry points where invalid input causes catastrophic behavior
 * (infinite loops, silent corruption).
 *
 * @param period - The period to validate
 */
function validatePeriod(period: ReadonlyPeriod): void {
  const hasInvalidDate =
    Number.isNaN(period.start.getTime()) || Number.isNaN(period.end.getTime());
  if (hasInvalidDate) {
    throw new Error(
      `Period contains invalid date: start=${String(period.start)}, end=${String(period.end)}`
    );
  }
  if (period.start.getTime() > period.end.getTime()) {
    throw new Error(
      `Period start (${period.start.toISOString()}) must be before or equal to end (${period.end.toISOString()})`
    );
  }
}

export { validatePeriod };
