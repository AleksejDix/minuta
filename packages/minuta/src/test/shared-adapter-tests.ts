import type { AllUnits } from "#src/types";
import { temporalUnits } from "#src/adapters/temporal/index";

type UnitsConfig = {
  name: string;
  createUnits: () => AllUnits;
  // Allow skipping certain adapters during development
  skip?: boolean;
};

// Every adapter's unit set, all with weeks starting on Monday
const testUnits: UnitsConfig[] = [
  {
    createUnits: (): AllUnits => temporalUnits({ weekStartsOn: 1 }),
    name: "Temporal",
  },
];

/**
 * One `[name, units]` case per enabled adapter, for `describe.each`.
 *
 * @returns One `[name, units]` tuple per enabled adapter
 */
function getUnitsTestCases(): (readonly [string, AllUnits])[] {
  return testUnits
    .filter((config: Readonly<UnitsConfig>) => config.skip !== true)
    .map(
      ({ name, createUnits }: Readonly<UnitsConfig>) =>
        [name, createUnits()] as const
    );
}

export { getUnitsTestCases };
