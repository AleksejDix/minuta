import { afterEach, describe, expect, it } from 'vitest'
import {
  backspace,
  beforeInput,
  cleanup,
  localDay,
  renderField,
  select,
  typeText,
} from './date-field-test-utils'

const EMPTY = '__.__.____'
const OCT_28 = '28.10.2026'
const FIELD_END = 10
const DAY_START = 0
const MONTH_START = 3
const MONTH_END = 5

describe('<DateFieldRoot> typing', () => {
  afterEach(cleanup)

  it.each([
    ['digits only', '28102026', OCT_28],
    ['dots', '28.10.2026', OCT_28],
    ['slashes', '28/10/2026', OCT_28],
    ['spaces', '28 10 2026', OCT_28],
    ['single-digit parts', '1.3.2026', '01.03.2026'],
    ['letters in between', 'ab28x10y2026', OCT_28],
    ['more digits than fit', '281020269', OCT_28],
  ])('types %s', { timeout: 5000 }, async (_name, text, expected) => {
    expect.hasAssertions()
    const { input } = await renderField('de-CH')
    typeText(input, text)
    expect(input.value).toBe(expected)
  })

  it.each([
    ['en-US', '10282026', '10/28/2026'],
    ['en-GB', '28102026', '28/10/2026'],
    ['ja-JP', '20261028', '2026/10/28'],
    ['fr-FR', '28102026', '28/10/2026'],
  ])('types in the %s order', { timeout: 5000 }, async (locale, text, expected) => {
    expect.hasAssertions()
    const { input } = await renderField(locale)
    typeText(input, text)
    expect(input.value).toBe(expected)
  })
})

describe('<DateFieldRoot> typed dates', () => {
  afterEach(cleanup)

  it('reports the typed date', { timeout: 5000 }, async () => {
    expect.hasAssertions()
    const field = await renderField('de-CH')
    typeText(field.input, '28102026')
    expect(field.date()).toStrictEqual(localDay('2026-10-28'))
  })

  it('reports no date while the field is incomplete', { timeout: 5000 }, async () => {
    expect.hasAssertions()
    const field = await renderField('de-CH')
    typeText(field.input, '2810202')
    expect(field.date()).toBeUndefined()
  })

  it('clamps a day the month does not have', { timeout: 5000 }, async () => {
    expect.hasAssertions()
    const { input } = await renderField('de-CH')
    typeText(input, '31.02.2026')
    expect(input.value).toBe('28.02.2026')
  })

  it('keeps 29 February in a leap year', { timeout: 5000 }, async () => {
    expect.hasAssertions()
    const { input } = await renderField('de-CH')
    typeText(input, '29.02.2028')
    expect(input.value).toBe('29.02.2028')
  })
})

describe('<DateFieldRoot> autofill', () => {
  it('reads a value set without typing', { timeout: 5000 }, async () => {
    expect.hasAssertions()
    const field = await renderField('de-CH')
    field.input.value = '2026-10-28'
    field.input.dispatchEvent(new Event('input', { bubbles: true }))
    expect(field.input.value).toBe('28.10.2026')
    expect(field.date()).toStrictEqual(localDay('2026-10-28'))
  })
})

describe('<DateFieldRoot> fixing typos', () => {
  afterEach(cleanup)

  it('retypes the last digit after a backspace', { timeout: 5000 }, async () => {
    expect.hasAssertions()
    const field = await renderField('de-CH')
    typeText(field.input, '28102026')
    backspace(field.input)
    typeText(field.input, '7')
    expect(field.input.value).toBe('28.10.2027')
    expect(field.date()).toStrictEqual(localDay('2027-10-28'))
  })

  it('retypes a selected month', { timeout: 5000 }, async () => {
    expect.hasAssertions()
    const { input } = await renderField('de-CH')
    typeText(input, '28102026')
    select(input, MONTH_START, MONTH_END)
    typeText(input, '11')
    expect(input.value).toBe('28.11.2026')
  })

  it('overwrites the day from the start', { timeout: 5000 }, async () => {
    expect.hasAssertions()
    const { input } = await renderField('de-CH')
    typeText(input, '28102026')
    select(input, DAY_START)
    typeText(input, '27')
    expect(input.value).toBe('27.10.2026')
  })
})

describe('<DateFieldRoot> deleting', () => {
  afterEach(cleanup)

  it('clears digits one backspace at a time', { timeout: 5000 }, async () => {
    expect.hasAssertions()
    const { input } = await renderField('de-CH')
    typeText(input, '28102026')
    backspace(input)
    backspace(input)
    expect(input.value).toBe('28.10.20__')
  })

  it('deletes forward one slot', { timeout: 5000 }, async () => {
    expect.hasAssertions()
    const { input } = await renderField('de-CH')
    typeText(input, '28102026')
    select(input, DAY_START)
    beforeInput(input, 'deleteContentForward')
    expect(input.value).toBe('_8.10.2026')
  })

  it.each(['deleteContentBackward', 'deleteByCut'])(
    'empties the field on select all and %s',
    { timeout: 5000 },
    async (inputType) => {
      expect.hasAssertions()
      const field = await renderField('de-CH')
      typeText(field.input, '28102026')
      select(field.input, DAY_START, FIELD_END)
      beforeInput(field.input, inputType)
      expect(field.input.value).toBe(EMPTY)
    },
  )
})
