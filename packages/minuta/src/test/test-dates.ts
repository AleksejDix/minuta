/**
 * Common test dates for consistent testing
 */

type TestDates = Readonly<{
  jan1: Date;
  jan10: Date;
  jan15: Date;
  feb15: Date;
  feb29: Date;
  may15: Date;
  jun1: Date;
  jun15: Date;
  jun30: Date;
  nov15: Date;
  dec31: Date;
  feb15_2023: Date;
  year2023: Date;
  year2025: Date;
}>;

// Various test dates throughout 2024
const testDates: TestDates = {
  // December dates
  dec31: new Date("2024-12-31T00:00:00"),

  // February dates (leap year)
  feb15: new Date("2024-02-15T00:00:00"),
  // Non-leap year
  feb15_2023: new Date("2023-02-15T00:00:00"),
  // Leap day
  feb29: new Date("2024-02-29T00:00:00"),

  // January dates
  jan1: new Date("2024-01-01T00:00:00"),
  // Wednesday
  jan10: new Date("2024-01-10T00:00:00"),
  jan15: new Date("2024-01-15T00:00:00"),

  // June dates
  jun1: new Date("2024-06-01T00:00:00"),
  jun15: new Date("2024-06-15T00:00:00"),
  jun30: new Date("2024-06-30T00:00:00"),

  // May dates (Q2)
  may15: new Date("2024-05-15T00:00:00"),

  // November dates (Q4)
  nov15: new Date("2024-11-15T00:00:00"),

  // Different years
  year2023: new Date("2023-06-15T00:00:00"),
  year2025: new Date("2025-06-15T00:00:00"),
};

export { testDates };
