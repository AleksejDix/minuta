import { describe } from "vitest";
import { createNativeAdapter } from "../adapters/native";
import { createDateFnsAdapter } from "../adapters/date-fns";
import { createLuxonAdapter } from "../adapters/luxon";
import { createTemporalAdapter } from "../adapters/temporal";

// Define adapter configurations
export interface AdapterConfig {
  name: string;
  createAdapter: () => Adapter;
  skip?: boolean; // Allow skipping certain adapters during development
}

// List of adapters to test
export const testAdapters: AdapterConfig[] = [
  {
    name: "Native",
    createAdapter: () => createNativeAdapter({ weekStartsOn: 1 }),
  },
  {
    name: "date-fns",
    createAdapter: () => createDateFnsAdapter({ weekStartsOn: 1 }),
  },
  {
    name: "Luxon",
    createAdapter: () => createLuxonAdapter({ weekStartsOn: 1 }),
  },
  {
    name: "Temporal",
    createAdapter: () => createTemporalAdapter({ weekStartsOn: 1 }),
  },
];

/**
 * Run a test suite with all configured adapters
 * @param suiteName - Name of the test suite
 * @param testFn - Function containing the tests, receives adapter as parameter
 */
export function withAllAdapters(
  suiteName: string,
  testFn: (adapter: Adapter, adapterName: string) => void
) {
  describe(suiteName, () => {
    testAdapters.forEach(({ name, createAdapter, skip }) => {
      const describeFn = skip ? describe.skip : describe;
      describeFn(`with ${name} adapter`, () => {
        const adapter = createAdapter();
        testFn(adapter, name);
      });
    });
  });
}

/**
 * Run a test suite with specific adapters using describe.each
 * This is useful when you want to use Vitest's parameterized tests
 */
export function getAdapterTestCases() {
  return testAdapters
    .filter((config) => !config.skip)
    .map(({ name, createAdapter }) => [name, createAdapter()] as const);
}
