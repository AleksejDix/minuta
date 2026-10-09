import type { AllUnits } from "#src/types";
import type { ComplianceOptions } from "./compliance/context";
import { createComplianceContext } from "./compliance/context";
import { registerAddTests } from "./compliance/add";
import { registerConsistencyTests } from "./compliance/consistency";
import { registerDiffContractTests } from "./compliance/diff-contract";
import { registerDiffTests } from "./compliance/diff";
import { registerEdgeCaseTests } from "./compliance/edge-cases";
import { registerEndOfTests } from "./compliance/end-of";
import { registerStartOfTests } from "./compliance/start-of";

/**
 * Compliance test suite that all adapters must pass
 * This ensures consistent behavior across different date library integrations
 * @param adapterName - Display name of the adapter
 * @param units - The unit specs under test
 * @param options - Optional timezone the adapter operates in
 */
function testAdapterCompliance(
  adapterName: string,
  units: AllUnits,
  options?: ComplianceOptions
): void {
  const ctx = createComplianceContext(adapterName, units, options);
  registerStartOfTests(ctx);
  registerEndOfTests(ctx);
  registerAddTests(ctx);
  registerDiffTests(ctx);
  registerDiffContractTests(ctx);
  registerEdgeCaseTests(ctx);
  registerConsistencyTests(ctx);
}

export { testAdapterCompliance };
