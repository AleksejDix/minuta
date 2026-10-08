type PlainDateParts = Readonly<{ year: number; month: number; day: number }>;

type TimeParts = Readonly<{
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
}>;

type PlainDateTimeParts = PlainDateParts & TimeParts;

const MONTH_INDEX_OFFSET = 1;

const MIDNIGHT: TimeParts = {
  hour: 0,
  millisecond: 0,
  minute: 0,
  second: 0,
};

/**
 * Convert a Temporal PlainDateTime to a local Date.
 * @param plainDateTime - Calendar date and wall-clock time components
 * @returns The local Date with the same components
 */
function plainDateTimeToLocal(plainDateTime: PlainDateTimeParts): Date {
  return new Date(
    plainDateTime.year,
    plainDateTime.month - MONTH_INDEX_OFFSET,
    plainDateTime.day,
    plainDateTime.hour,
    plainDateTime.minute,
    plainDateTime.second,
    plainDateTime.millisecond
  );
}

/**
 * Convert a Temporal PlainDate to a local Date, preserving local time semantics.
 *
 * `new Date(plainDate.toString())` parses the ISO string as UTC, which shifts
 * the date in non-UTC timezones. Instead, construct via local-time components.
 * @param plainDate - Calendar date components
 * @param time - Wall-clock time components (defaults to midnight)
 * @returns The local Date
 */
function plainDateToLocal(
  plainDate: PlainDateParts,
  time: TimeParts = MIDNIGHT
): Date {
  return plainDateTimeToLocal({
    day: plainDate.day,
    hour: time.hour,
    millisecond: time.millisecond,
    minute: time.minute,
    month: plainDate.month,
    second: time.second,
    year: plainDate.year,
  });
}

/**
 * Extract the wall-clock time components of a local Date.
 * @param date - The local Date
 * @returns Its time components
 */
function timeOf(date: Readonly<Date>): TimeParts {
  return {
    hour: date.getHours(),
    millisecond: date.getMilliseconds(),
    minute: date.getMinutes(),
    second: date.getSeconds(),
  };
}

export { plainDateTimeToLocal, plainDateToLocal, timeOf };
