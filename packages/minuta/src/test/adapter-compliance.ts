import type { Adapter } from "#src/types";
import type { ComplianceOptions } from "./compliance/context";
import { createComplianceContext } from "./compliance/context";
import { registerAddTests } from "./compliance/add";
import { registerConsistencyTests } from "./compliance/consistency";
import { registerDiffTests } from "./compliance/diff";
import { registerEdgeCaseTests } from "./compliance/edge-cases";
import { registerEndOfTests } from "./compliance/end-of";
import { registerStartOfTests } from "./compliance/start-of";

/**
 * Compliance test suite that all adapters must pass
 * This ensures consistent behavior across different date library integrations
 * @param adapterName - Display name of the adapter
 * @param adapter - The adapter under test
 * @param options - Optional timezone the adapter operates in
 */
function testAdapterCompliance(
  adapterName: string,
  adapter: Readonly<Adapter>,
  options?: ComplianceOptions
): void {
  const ctx = createComplianceContext(adapterName, adapter, options);
  registerStartOfTests(ctx);
  registerEndOfTests(ctx);
  registerAddTests(ctx);
  registerDiffTests(ctx);
  registerEdgeCaseTests(ctx);
  registerConsistencyTests(ctx);
}

export { testAdapterCompliance };
