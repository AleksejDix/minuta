import type { Adapter } from "#src/types";
import { createDateFnsAdapter } from "#src/adapters/date-fns/index";
import { createDayjsAdapter } from "#src/adapters/dayjs/index";
import { createLuxonAdapter } from "#src/adapters/luxon/index";
import { createMinutaAdapter } from "#src/adapters/temporal/index";
import { createMomentAdapter } from "#src/adapters/moment/index";
import { createNativeAdapter } from "#src/adapters/native/index";

// Define adapter configurations
type AdapterConfig = {
  name: string;
  createAdapter: () => Adapter;
  // Allow skipping certain adapters during development
  skip?: boolean;
};

// List of adapters to test
const testAdapters: AdapterConfig[] = [
  {
    createAdapter: (): Adapter => createNativeAdapter({ weekStartsOn: 1 }),
    name: "Native",
  },
  {
    createAdapter: (): Adapter => createDateFnsAdapter({ weekStartsOn: 1 }),
    name: "date-fns",
  },
  {
    createAdapter: (): Adapter => createDayjsAdapter({ weekStartsOn: 1 }),
    name: "Day.js",
  },
  {
    createAdapter: (): Adapter => createLuxonAdapter({ weekStartsOn: 1 }),
    name: "Luxon",
  },
  {
    createAdapter: (): Adapter => createMomentAdapter({ weekStartsOn: 1 }),
    name: "Moment.js",
  },
  {
    createAdapter: (): Adapter => createMinutaAdapter({ weekStartsOn: 1 }),
    name: "Temporal",
  },
];

/**
 * Run a test suite with specific adapters using describe.each
 * This is useful when you want to use Vitest's parameterized tests
 * @returns One `[name, adapter]` tuple per enabled adapter
 */
function getAdapterTestCases(): (readonly [string, Adapter])[] {
  return testAdapters
    .filter((config: Readonly<AdapterConfig>) => config.skip !== true)
    .map(
      ({ name, createAdapter }: Readonly<AdapterConfig>) =>
        [name, createAdapter()] as const
    );
}

export { getAdapterTestCases };
