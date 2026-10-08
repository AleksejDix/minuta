import type { AllUnits } from "#src/types";
import type { ComplianceOptions } from "./compliance/context";
import { dateFnsTzUnits } from "#src/adapters/date-fns-tz/index";
import { dateFnsUnits } from "#src/adapters/date-fns/index";
import { describe } from "vitest";
import { luxonUnits } from "#src/adapters/luxon/index";
import { nativeUnits } from "#src/adapters/native/index";
import { temporalUnits } from "#src/adapters/temporal/index";
import { testAdapterCompliance } from "./adapter-compliance";

type ComplianceCase = Readonly<{
  name: string;
  units: AllUnits;
  options: ComplianceOptions | undefined;
}>;

const complianceCases: readonly ComplianceCase[] = [
  {
    name: "Native",
    options: undefined,
    units: nativeUnits({ weekStartsOn: 1 }),
  },
  {
    name: "date-fns",
    options: undefined,
    units: dateFnsUnits({ weekStartsOn: 1 }),
  },
  {
    name: "date-fns-tz",
    options: { timezone: "UTC" },
    units: dateFnsTzUnits({ timezone: "UTC", weekStartsOn: 1 }),
  },
  {
    name: "Luxon",
    options: undefined,
    units: luxonUnits({ weekStartsOn: 1 }),
  },
  // Temporal adapter - now includes polyfill automatically
  {
    name: "Temporal",
    options: undefined,
    units: temporalUnits({ weekStartsOn: 1 }),
  },
];

// Run compliance tests for all adapters
describe.each(complianceCases)(
  "adapter compliance tests",
  ({ name, options, units }: ComplianceCase) => {
    // oxlint-disable-next-line vitest/require-hook -- testAdapterCompliance registers suites, which must happen synchronously at collection time
    testAdapterCompliance(name, units, options);
  }
);
