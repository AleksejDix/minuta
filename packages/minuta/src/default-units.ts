/**
 * The units of the main entry: `createUnits()`, weeks starting on Monday,
 * moments in the runtime's zone.
 */
import type { Units } from "#src/types";
import { createUnits } from "#src/create-units";

/*
 * Each function binds the units on its own, so bundlers drop the unused
 * ones. A test compares them with `withUnits`, so the two cannot drift apart.
 */
// oxlint-disable-next-line eslint/no-inline-comments -- The pure marker lets bundlers drop the units when no bound function is used
const units: Units = /* @__PURE__ */ createUnits();

export { units };
