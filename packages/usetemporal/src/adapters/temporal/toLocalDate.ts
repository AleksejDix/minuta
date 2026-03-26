/**
 * Convert a Temporal PlainDate to a local Date, preserving local time semantics.
 *
 * `new Date(plainDate.toString())` parses the ISO string as UTC, which shifts
 * the date in non-UTC timezones. Instead, construct via local-time components.
 */
export function plainDateToLocal(
  plainDate: { year: number; month: number; day: number },
  hours = 0,
  minutes = 0,
  seconds = 0,
  milliseconds = 0
): Date {
  return new Date(
    plainDate.year,
    plainDate.month - 1,
    plainDate.day,
    hours,
    minutes,
    seconds,
    milliseconds
  );
}

/**
 * Convert a Temporal PlainDateTime to a local Date.
 */
export function plainDateTimeToLocal(plainDateTime: {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
}): Date {
  return new Date(
    plainDateTime.year,
    plainDateTime.month - 1,
    plainDateTime.day,
    plainDateTime.hour,
    plainDateTime.minute,
    plainDateTime.second,
    plainDateTime.millisecond
  );
}
