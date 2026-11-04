import { temporalReady } from "./packages/minuta/src/temporal-api.ts";

/*
 * Node 24 has no Temporal: install the polyfill the way apps do, before any
 * test file loads (some compute while they load)
 */
// oxlint-disable-next-line node/no-top-level-await -- vitest awaits setup files and never require()s them
await temporalReady();
