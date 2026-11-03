import { beforeAll } from "vitest";
import { temporalReady } from "./packages/minuta/src/adapters/temporal/temporal-api.ts";

// Node 24 has no Temporal: install the polyfill the way apps do
beforeAll(temporalReady);
