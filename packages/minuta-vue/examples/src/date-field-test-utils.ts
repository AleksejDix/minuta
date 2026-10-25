import type { App, Component, ComputedRef, VNode } from 'vue'
import { createApp, defineComponent, h, nextTick } from 'vue'
import { deriveFormat, fromDate, segmentsToString } from '@aleksejdix/datefield'
import DateFieldInput from './DateFieldInput.vue'
import DateFieldRoot from './DateFieldRoot.vue'
import { useDateFieldContext } from './date-field-context'

const LABEL = 'Date'
const ALL = 0

type Field = Readonly<{
  /** The field's date, `undefined` while incomplete */
  date: () => Readonly<Date> | undefined
  input: HTMLInputElement
}>

type Mounted = Readonly<{ app: App; element: HTMLElement }>

const mounted: Mounted[] = []

/**
 * Unmount every field `renderField` mounted.
 */
function cleanup(): void {
  for (const { app, element } of mounted.splice(ALL)) {
    app.unmount()
    element.remove()
  }
}

type Probed = Readonly<{
  date: ComputedRef<Readonly<Date> | undefined>
  element: HTMLElement
}>

// Read through a reference, so the lint does not take it for a React hook
const readContext: typeof useDateFieldContext = useDateFieldContext

type DateProbe = Readonly<{
  component: Component
  date: () => ComputedRef<Readonly<Date> | undefined> | undefined
}>

// A field part that renders nothing and reads the field's date
function dateProbe(): DateProbe {
  let date: ComputedRef<Readonly<Date> | undefined> | undefined = undefined
  const component = defineComponent({
    setup: () => {
      ;({ date } = readContext())
      return (): undefined => undefined
    },
  })
  return { component, date: () => date }
}

// The demo's field: its root, the input and the probe
// oxlint-disable-next-line typescript/prefer-readonly-parameter-types -- Vue's Component type cannot be deeply readonly
function fieldTree(locale: string, value: Readonly<Date> | undefined, probe: Component): Component {
  return defineComponent({
    setup: () => (): VNode =>
      h(
        DateFieldRoot,
        { locale, value },
        { default: () => [h(DateFieldInput, { label: LABEL }), h(probe)] },
      ),
  })
}

// Mount the field with a probe that reads its date
function mountField(locale: string, value: Readonly<Date> | undefined): Probed {
  const probe = dateProbe()
  const element = document.createElement('div')
  document.body.append(element)
  const app = createApp(fieldTree(locale, value, probe.component))
  app.mount(element)
  mounted.push({ app, element })
  const date = probe.date()
  if (date === undefined) {
    throw new TypeError('Expected the probe to read the field')
  }
  return { date, element }
}

/**
 * Render the demo's date field and read its date.
 *
 * @param locale - Locale that decides the format
 * @param value - Initial date
 * @returns The input and the field's date, once input-dom is attached
 */
async function renderField(locale: string, value?: Readonly<Date>): Promise<Field> {
  const { date, element } = mountField(locale, value)
  // The input's ref reaches the field, and input-dom attaches, on the next tick
  await nextTick()
  const input = element.querySelector('input')
  if (input === null) {
    throw new TypeError("Expected the field's input")
  }
  return { date: () => date.value, input }
}

function beforeInput(input: HTMLInputElement, inputType: string, data = ''): void {
  input.dispatchEvent(
    new InputEvent('beforeinput', {
      bubbles: true,
      cancelable: true,
      data,
      inputType,
    }),
  )
}

function typeText(input: HTMLInputElement, text: string): void {
  for (const char of text) {
    beforeInput(input, 'insertText', char)
  }
}

function pasteText(input: HTMLInputElement, text: string): void {
  beforeInput(input, 'insertFromPaste', text)
}

function backspace(input: HTMLInputElement): void {
  beforeInput(input, 'deleteContentBackward')
}

function select(input: HTMLInputElement, start: number, end = start): void {
  input.setSelectionRange(start, end)
  input.dispatchEvent(new Event('select'))
}

function pressKey(input: HTMLInputElement, key: string): void {
  input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key }))
}

/**
 * A local calendar day, e.g. `localDay("2026-10-28")`.
 *
 * @param iso - The day as `YYYY-MM-DD`
 * @returns Local midnight of that day
 */
function localDay(iso: string): Date {
  return new Date(`${iso}T00:00:00`)
}

/**
 * The text the field shows for a date.
 *
 * @param locale - Locale that decides the format
 * @param date - The date
 * @returns The formatted field text
 */
function shown(locale: string, date: Readonly<Date>): string {
  return segmentsToString(fromDate(date, deriveFormat(locale), locale))
}

export {
  backspace,
  beforeInput,
  cleanup,
  localDay,
  pasteText,
  pressKey,
  renderField,
  select,
  shown,
  typeText,
}
export type { Field }
