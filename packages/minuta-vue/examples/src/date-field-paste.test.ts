import { afterEach, describe, expect, it } from 'vitest'
import {
  beforeInput,
  cleanup,
  localDay,
  pasteText,
  renderField,
  select,
  typeText,
} from './date-field-test-utils'

const EMPTY = '__.__.____'
const OCT_28 = '28.10.2026'
const MONTH_INSIDE = 4

describe('<DateFieldRoot> pasting written dates', () => {
  afterEach(cleanup)

  it.each([
    '28.10.2026',
    '28/10/2026',
    '28-10-2026',
    '2026-10-28',
    '20261028',
    '28.10.26',
    '  28.10.2026  ',
    '2026-10-28T14:35:00Z',
    'Wed Oct 28 2026',
    'Wed, 28 Oct 2026 10:00:00 GMT',
    'October 28, 2026',
    '28 October 2026',
    '28. Oktober 2026',
  ])('reads %j', { timeout: 5000 }, async (text) => {
    expect.hasAssertions()
    const field = await renderField('de-CH')
    pasteText(field.input, text)
    expect(field.input.value).toBe(OCT_28)
    expect(field.date()).toStrictEqual(localDay('2026-10-28'))
  })

  it('reads a dropped date like a pasted one', { timeout: 5000 }, async () => {
    expect.hasAssertions()
    const { input } = await renderField('de-CH')
    beforeInput(input, 'insertFromDrop', '2026-10-28')
    expect(input.value).toBe(OCT_28)
  })
})

describe('<DateFieldRoot> pasting in a locale', () => {
  afterEach(cleanup)

  it.each([
    ['en-US', '10/28/2026'],
    ['en-GB', '28/10/2026'],
    ['ja-JP', '2026/10/28'],
    ['ko-KR', '2026. 10. 28.'],
    ['fr-FR', '28/10/2026'],
  ])("reads 'Wed Oct 28 2026' into the %s format", { timeout: 5000 }, async (locale, expected) => {
    expect.hasAssertions()
    const { input } = await renderField(locale)
    pasteText(input, 'Wed Oct 28 2026')
    expect(input.value).toBe(expected)
  })

  it.each([
    ['de-CH', '03.04.2026'],
    ['en-US', '03/04/2026'],
  ])('reads an ambiguous date in the %s order', { timeout: 5000 }, async (locale, expected) => {
    expect.hasAssertions()
    const { input } = await renderField(locale)
    pasteText(input, '3/4/2026')
    expect(input.value).toBe(expected)
  })

  it.each([
    ['en-US', '28/10/2026', '10/28/2026'],
    ['fr-FR', '28 octobre 2026', '28/10/2026'],
  ])('reads %s from %j', { timeout: 5000 }, async (locale, text, expected) => {
    expect.hasAssertions()
    const { input } = await renderField(locale)
    pasteText(input, text)
    expect(input.value).toBe(expected)
  })
})

describe('<DateFieldRoot> pasting over a value', () => {
  afterEach(cleanup)

  it('replaces the whole value wherever the cursor is', { timeout: 5000 }, async () => {
    expect.hasAssertions()
    const { input } = await renderField('de-CH')
    typeText(input, '28102026')
    select(input, MONTH_INSIDE)
    pasteText(input, '2026-01-05')
    expect(input.value).toBe('05.01.2026')
  })

  it('types text it cannot read as a date', { timeout: 5000 }, async () => {
    expect.hasAssertions()
    const { input } = await renderField('de-CH')
    pasteText(input, 'room 12')
    expect(input.value).toBe('12.__.____')
  })

  it('ignores pasted text without digits or a date', { timeout: 5000 }, async () => {
    expect.hasAssertions()
    const { input } = await renderField('de-CH')
    pasteText(input, 'hello')
    expect(input.value).toBe(EMPTY)
  })
})
