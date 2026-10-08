type SnapMode = "nearest" | "floor" | "ceil";

function roundingFor(mode: SnapMode): (value: number) => number {
  if (mode === "floor") {
    return Math.floor;
  }
  if (mode === "ceil") {
    return Math.ceil;
  }
  return Math.round;
}

/**
 * Snap a date to the nearest interval boundary.
 *
 * @param date - The date to snap
 * @param intervalMs - Interval size in milliseconds
 * @param mode - Rounding strategy: 'nearest' (default), 'floor', 'ceil'
 * @returns The snapped date
 *
 * @example
 * snap(new Date('2024-03-15T10:37:00'), 15 * 60000)          // → 10:45 (nearest)
 * snap(new Date('2024-03-15T10:37:00'), 15 * 60000, 'floor') // → 10:30
 * snap(new Date('2024-03-15T10:37:00'), 15 * 60000, 'ceil')  // → 10:45
 */
function snap(
  date: Readonly<Date>,
  intervalMs: number,
  mode: SnapMode = "nearest"
): Date {
  const roundFn = roundingFor(mode);
  return new Date(roundFn(date.getTime() / intervalMs) * intervalMs);
}

export { snap };
