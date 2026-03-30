/**
 * Snap a date to the nearest interval boundary.
 *
 * @param date - The date to snap
 * @param intervalMs - Interval size in milliseconds
 * @param mode - Rounding strategy: 'nearest' (default), 'floor', 'ceil'
 *
 * @example
 * snap(new Date('2024-03-15T10:37:00'), 15 * 60000)          // → 10:45 (nearest)
 * snap(new Date('2024-03-15T10:37:00'), 15 * 60000, 'floor') // → 10:30
 * snap(new Date('2024-03-15T10:37:00'), 15 * 60000, 'ceil')  // → 10:45
 */
export function snap(
  date: Date,
  intervalMs: number,
  mode: "nearest" | "floor" | "ceil" = "nearest"
): Date {
  const ms = date.getTime();
  const roundFn =
    mode === "floor" ? Math.floor : mode === "ceil" ? Math.ceil : Math.round;
  return new Date(roundFn(ms / intervalMs) * intervalMs);
}
