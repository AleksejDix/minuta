/**
 * Import first wherever the demo computes: Safari has no Temporal yet, and a
 * module that imports this one runs only once the polyfill is installed.
 */
import { temporalReady } from "@aleksejdix/minuta/temporal";

// oxlint-disable-next-line node/no-top-level-await -- the browser loads this as an ES module, never through require()
await temporalReady();
