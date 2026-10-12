import { afterEach, describe, expect, it } from "vitest";
import {
  dayStepDrift,
  misreadPastes,
  mistypedDates,
  repastedChanges,
} from "./date-field-properties";
import { brokenEdits } from "./date-field-edits";
import { cleanup } from "@testing-library/react";

// The demo's locales
const LOCALES = ["de-CH", "en-US", "en-GB", "ja-JP", "ko-KR", "fr-FR"];

describe.each(LOCALES)("<DateFieldRoot> invariants in %s", (locale) => {
  afterEach(cleanup);

  it(
    "reads every written form of a date as that date",
    { timeout: 20_000 },
    () => {
      expect.hasAssertions();
      expect(misreadPastes(locale)).toStrictEqual([]);
    }
  );

  it("types any date it shows back to itself", { timeout: 20_000 }, () => {
    expect.hasAssertions();
    expect(mistypedDates(locale)).toStrictEqual([]);
  });

  it(
    "keeps its value when it is copied and pasted",
    { timeout: 20_000 },
    () => {
      expect.hasAssertions();
      expect(repastedChanges(locale)).toStrictEqual([]);
    }
  );

  it("undoes day steps by stepping back", { timeout: 20_000 }, () => {
    expect.hasAssertions();
    expect(dayStepDrift(locale)).toStrictEqual([]);
  });

  it("stays a well-formed date through any edits", { timeout: 30_000 }, () => {
    expect.hasAssertions();
    expect(brokenEdits(locale)).toStrictEqual([]);
  });
});
