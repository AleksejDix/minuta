import type { Adapter } from "#src/types";
import { Temporal } from "@js-temporal/polyfill";

const MONTH_INDEX_OFFSET = 1;
const UTC = "UTC";

const DEFAULT_TIME = {
  hour: 0,
  millisecond: 0,
  minute: 0,
  second: 0,
} as const;

type ComplianceOptions = Readonly<{ timezone?: string }>;

type DateInput = Readonly<{
  year: number;
  month: number;
  day: number;
  hour?: number;
  minute?: number;
  second?: number;
  millisecond?: number;
}>;

type ZonedParts = Readonly<{
  year: number;
  monthIndex: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
}>;

type ComplianceContext = Readonly<{
  adapter: Readonly<Adapter>;
  adapterName: string;
  createDate: (input: DateInput) => Date;
  parts: (date: Readonly<Date>) => ZonedParts;
  testDate: Readonly<Date>;
}>;

function toDate(input: DateInput, isUtc: boolean): Date {
  const hour = input.hour ?? DEFAULT_TIME.hour;
  const minute = input.minute ?? DEFAULT_TIME.minute;
  const second = input.second ?? DEFAULT_TIME.second;
  const millisecond = input.millisecond ?? DEFAULT_TIME.millisecond;
  if (isUtc) {
    return new Date(
      Date.UTC(
        input.year,
        input.month,
        input.day,
        hour,
        minute,
        second,
        millisecond
      )
    );
  }
  return new Date(
    input.year,
    input.month,
    input.day,
    hour,
    minute,
    second,
    millisecond
  );
}

function zonedParts(date: Readonly<Date>, timeZone: string): ZonedParts {
  const zoned = Temporal.Instant.from(date.toISOString()).toZonedDateTimeISO(
    timeZone
  );
  return {
    day: zoned.day,
    hour: zoned.hour,
    millisecond: zoned.millisecond,
    minute: zoned.minute,
    monthIndex: zoned.month - MONTH_INDEX_OFFSET,
    second: zoned.second,
    year: zoned.year,
  };
}

function resolveTimeZone(options: ComplianceOptions | undefined): string {
  if (options === undefined || options.timezone === undefined) {
    return new Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
  return options.timezone;
}

/**
 * Build the shared context for the adapter compliance suites.
 * @param adapterName - Display name of the adapter
 * @param adapter - The adapter under test
 * @param options - Optional timezone the adapter operates in
 * @returns The compliance context
 */
function createComplianceContext(
  adapterName: string,
  adapter: Readonly<Adapter>,
  options: ComplianceOptions | undefined
): ComplianceContext {
  // When testing a UTC-based adapter, construct dates as UTC so local TZ doesn't skew results
  const isUtc = options !== undefined && options.timezone === UTC;
  const timeZone = resolveTimeZone(options);

  // June 15, 2024 14:30:45.123
  const testDate = toDate(
    {
      day: 15,
      hour: 14,
      millisecond: 123,
      minute: 30,
      month: 5,
      second: 45,
      year: 2024,
    },
    isUtc
  );

  return {
    adapter,
    adapterName,
    createDate: (input: DateInput): Date => toDate(input, isUtc),
    parts: (date: Readonly<Date>): ZonedParts => zonedParts(date, timeZone),
    testDate,
  };
}

export { createComplianceContext };
export type { ComplianceContext, ComplianceOptions };
