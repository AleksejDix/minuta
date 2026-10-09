import type { AllUnits } from "#src/types";
import type { ComplianceOptions } from "./compliance/context";
import { dateFnsTzUnits } from "#src/adapters/date-fns-tz/index";
import { describe } from "vitest";
import { getUnitsTestCases } from "./shared-adapter-tests";
import { testAdapterCompliance } from "./adapter-compliance";

type ComplianceCase = Readonly<{
  name: string;
  units: AllUnits;
  options: ComplianceOptions | undefined;
}>;

// Every adapter, weeks starting on Monday; date-fns-tz in UTC
const complianceCases: readonly ComplianceCase[] = [
  ...getUnitsTestCases().map(([name, units]) => ({
    name,
    options: undefined,
    units,
  })),
  {
    name: "date-fns-tz",
    options: { timezone: "UTC" },
    units: dateFnsTzUnits({ timeZone: "UTC", weekStartsOn: "monday" }),
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
