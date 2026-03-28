import { describe } from "vitest";
import { testAdapterCompliance } from "./adapter-compliance";
import { createNativeAdapter } from "../adapters/native";
import { createDateFnsAdapter } from "../adapters/date-fns";
import { createDateFnsTzAdapter } from "../adapters/date-fns-tz";
import { createLuxonAdapter } from "../adapters/luxon";
import { createTemporalAdapter } from "../adapters/temporal";

// Run compliance tests for all adapters
describe("Adapter Compliance Tests", () => {
  // Native adapter
  testAdapterCompliance("Native", createNativeAdapter({ weekStartsOn: 1 }));

  // date-fns adapter
  testAdapterCompliance("date-fns", createDateFnsAdapter({ weekStartsOn: 1 }));

  // date-fns-tz adapter
  testAdapterCompliance(
    "date-fns-tz",
    createDateFnsTzAdapter({ timezone: "UTC", weekStartsOn: 1 }),
    { timezone: "UTC" }
  );

  // Luxon adapter
  testAdapterCompliance("Luxon", createLuxonAdapter({ weekStartsOn: 1 }));

  // Temporal adapter - now includes polyfill automatically
  testAdapterCompliance("Temporal", createTemporalAdapter({ weekStartsOn: 1 }));
});
