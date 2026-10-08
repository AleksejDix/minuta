import type { ComputedRef, ShallowRef } from 'vue'
import {
  clampDay,
  dateMask,
  deriveFormat,
  fromDate,
  parseSegments,
  rotateSegment,
  segmentAtPosition,
  segmentsToString,
  toDate,
  withSegments,
} from 'datefield'
import { computed, shallowRef, watch } from 'vue'
import type { DateFormat } from 'datefield'
import type { InputController } from 'input-dom'
import type { InputState } from 'input-state'
import { attachInput } from 'input-dom'
import { createInputState } from 'input-state'

type DateField = Readonly<{
  date: ComputedRef<Readonly<Date> | undefined>
  element: ShallowRef<HTMLInputElement | undefined>
  setDate: (date: Readonly<Date>) => void
  state: Readonly<ShallowRef<InputState>>
}>

type AttachedField = Readonly<{
  format: Readonly<DateFormat>
  initial: InputState
  onChange: (next: InputState) => void
}>

type Session = Readonly<{
  controller: ShallowRef<InputController | undefined>
  lastDate: ShallowRef<Readonly<Date> | undefined>
  locale: () => string
  state: ShallowRef<InputState>
}>

const UP = 1
const DOWN = -1

/**
 * Builds the input state of a format, filled with a date when given.
 *
 * @param format - The date format
 * @param date - The date to show, if any
 * @param locale - The locale of the format
 * @returns The input state
 */
function fieldFor(
  format: Readonly<DateFormat>,
  date: Readonly<Date> | undefined,
  locale: string,
): InputState {
  const mask = dateMask(format)
  if (date === undefined) {
    return createInputState({ mask })
  }
  return createInputState({
    mask,
    value: segmentsToString(fromDate(date, format, locale)),
  })
}

/**
 * Maps an arrow key to a rotation direction.
 *
 * @param key - The key name
 * @returns 1 for ArrowUp, -1 otherwise
 */
function rotationDirection(key: string): typeof UP | typeof DOWN {
  if (key === 'ArrowUp') {
    return UP
  }
  return DOWN
}

/**
 * Rotates the segment under the caret on ArrowUp / ArrowDown.
 *
 * @param format - The date format
 * @param state - The current input state
 * @param key - The pressed key
 * @returns The rotated state, or undefined for other keys
 */
function rotated(
  format: Readonly<DateFormat>,
  state: InputState,
  key: string,
): InputState | undefined {
  if (key !== 'ArrowUp' && key !== 'ArrowDown') {
    return undefined
  }
  const segments = parseSegments(format, state.buffer.text)
  const index = segmentAtPosition(segments, state.buffer.selection.head)
  return withSegments(state, rotateSegment(segments, index, rotationDirection(key)))
}

/**
 * Attaches input-dom to an element with the datefield mask, day clamping and
 * segment rotation.
 *
 * @param element - The input element
 * @param field - The format, the initial state and the change listener
 * @returns The input-dom controller
 */
function attachField(element: HTMLInputElement, field: AttachedField): InputController {
  const { format, initial, onChange } = field
  return attachInput(element, initial, {
    normalize: (next) => withSegments(next, clampDay(parseSegments(format, next.buffer.text))),
    onChange,
    onKeyDown: (event, next) => rotated(format, next, event.key),
  })
}

/**
 * Attaches input-dom to an input with the current date in a format.
 *
 * @param session - The field's shared refs and locale
 * @param input - The input element
 * @param format - The date format of the locale
 * @returns The input-dom controller
 */
function attachSession(
  session: Session,
  input: HTMLInputElement,
  format: Readonly<DateFormat>,
): InputController {
  const attached = attachField(input, {
    format,
    initial: fieldFor(format, session.lastDate.value, session.locale()),
    onChange: (next) => {
      // Remembered with this format, so a new locale keeps the date
      session.lastDate.value = toDate(parseSegments(format, next.buffer.text))
      session.state.value = next
    },
  })
  session.controller.value = attached
  session.state.value = attached.getState()
  return attached
}

/**
 * Vue is one consumer of the vanilla stack: input-dom owns the field state,
 * Vue only mirrors it for rendering. A new locale re-attaches with its mask
 * and keeps the current date.
 *
 * @param locale - Getter of the locale that decides the date format
 * @param initialDate - Date shown before the user types
 * @returns The date, the element to attach to, a date setter and the state
 */
function useDateField(locale: () => string, initialDate: Readonly<Date> | undefined): DateField {
  const element = shallowRef<HTMLInputElement>()
  const format = computed(() => deriveFormat(locale()))
  const session: Session = {
    controller: shallowRef<InputController>(),
    lastDate: shallowRef(initialDate),
    locale,
    state: shallowRef(fieldFor(format.value, initialDate, locale())),
  }

  watch(
    [element, format],
    (
      [input, inputFormat]: readonly [HTMLInputElement | undefined, Readonly<DateFormat>],
      _previous: unknown,
      onCleanup,
    ) => {
      if (input !== undefined) {
        const attached = attachSession(session, input, inputFormat)
        onCleanup(() => {
          attached.destroy()
        })
      }
    },
    { immediate: true },
  )

  /**
   * Replaces the field's value, in input-dom and in the mirrored state.
   *
   * @param date - The new date
   */
  function setDate(date: Readonly<Date>): void {
    const next = fieldFor(format.value, date, locale())
    session.lastDate.value = date
    if (session.controller.value !== undefined) {
      session.controller.value.setState(next)
    }
    session.state.value = next
  }

  const date = computed(() => toDate(parseSegments(format.value, session.state.value.buffer.text)))
  return { date, element, setDate, state: session.state }
}

export { useDateField }
export type { DateField }
