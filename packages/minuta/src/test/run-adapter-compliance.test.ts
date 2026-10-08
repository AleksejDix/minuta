import type { Adapter } from "#src/types";
import type { ComplianceOptions } from "./compliance/context";
import { createDateFnsAdapter } from "#src/adapters/date-fns/index";
import { createDateFnsTzAdapter } from "#src/adapters/date-fns-tz/index";
import { createLuxonAdapter } from "#src/adapters/luxon/index";
import { createMinutaAdapter } from "#src/adapters/temporal/index";
import { createNativeAdapter } from "#src/adapters/native/index";
import { describe } from "vitest";
import { testAdapterCompliance } from "./adapter-compliance";

type ComplianceCase = Readonly<{
  name: string;
  adapter: Adapter;
  options: ComplianceOptions | undefined;
}>;

const complianceCases: readonly ComplianceCase[] = [
  {
    adapter: createNativeAdapter({ weekStartsOn: 1 }),
    name: "Native",
    options: undefined,
  },
  {
    adapter: createDateFnsAdapter({ weekStartsOn: 1 }),
    name: "date-fns",
    options: undefined,
  },
  {
    adapter: createDateFnsTzAdapter({ timezone: "UTC", weekStartsOn: 1 }),
    name: "date-fns-tz",
    options: { timezone: "UTC" },
  },
  {
    adapter: createLuxonAdapter({ weekStartsOn: 1 }),
    name: "Luxon",
    options: undefined,
  },
  // Temporal adapter - now includes polyfill automatically
  {
    adapter: createMinutaAdapter({ weekStartsOn: 1 }),
    name: "Temporal",
    options: undefined,
  },
];

// Run compliance tests for all adapters
describe.each(complianceCases)(
  "adapter compliance tests",
  ({ name, adapter, options }: ComplianceCase) => {
    // oxlint-disable-next-line vitest/require-hook -- testAdapterCompliance registers suites, which must happen synchronously at collection time
    testAdapterCompliance(name, adapter, options);
  }
);
