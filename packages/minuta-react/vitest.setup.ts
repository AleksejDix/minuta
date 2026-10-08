import { beforeAll } from "vitest";

// React's act() warns unless the test environment declares itself as one
beforeAll(() => {
  Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);
});
