import type { AllUnits } from "#src/types";
import { dateFnsUnits } from "#src/adapters/date-fns/index";
import { dayjsUnits } from "#src/adapters/dayjs/index";
import { luxonUnits } from "#src/adapters/luxon/index";
import { momentUnits } from "#src/adapters/moment/index";
import { nativeUnits } from "#src/adapters/native/index";
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
    createUnits: (): AllUnits => nativeUnits({ weekStartsOn: 1 }),
    name: "Native",
  },
  {
    createUnits: (): AllUnits => dateFnsUnits({ weekStartsOn: 1 }),
    name: "date-fns",
  },
  {
    createUnits: (): AllUnits => dayjsUnits({ weekStartsOn: 1 }),
    name: "Day.js",
  },
  {
    createUnits: (): AllUnits => luxonUnits({ weekStartsOn: 1 }),
    name: "Luxon",
  },
  {
    createUnits: (): AllUnits => momentUnits({ weekStartsOn: 1 }),
    name: "Moment.js",
  },
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
