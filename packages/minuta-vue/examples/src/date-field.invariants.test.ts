import { afterEach, describe, expect, it } from 'vitest'
import {
  dayStepDrift,
  misreadPastes,
  mistypedDates,
  repastedChanges,
} from './date-field-properties'
import { brokenEdits } from './date-field-edits'
import { cleanup } from './date-field-test-utils'

// The demo's locales
const LOCALES = ['de-CH', 'en-US', 'en-GB', 'ja-JP', 'ko-KR', 'fr-FR']

describe.each(LOCALES)('<DateFieldRoot> invariants in %s', (locale) => {
  afterEach(cleanup)

  it('reads every written form of a date as that date', { timeout: 20_000 }, async () => {
    expect.hasAssertions()
    await expect(misreadPastes(locale)).resolves.toStrictEqual([])
  })

  it('types any date it shows back to itself', { timeout: 20_000 }, async () => {
    expect.hasAssertions()
    await expect(mistypedDates(locale)).resolves.toStrictEqual([])
  })

  it('keeps its value when it is copied and pasted', { timeout: 20_000 }, async () => {
    expect.hasAssertions()
    await expect(repastedChanges(locale)).resolves.toStrictEqual([])
  })

  it('undoes day steps by stepping back', { timeout: 20_000 }, async () => {
    expect.hasAssertions()
    await expect(dayStepDrift(locale)).resolves.toStrictEqual([])
  })

  it('stays a well-formed date through any edits', { timeout: 30_000 }, async () => {
    expect.hasAssertions()
    await expect(brokenEdits(locale)).resolves.toStrictEqual([])
  })
})
