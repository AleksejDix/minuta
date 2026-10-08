import type { DateField } from './use-date-field'
import type { InjectionKey } from 'vue'
import { inject } from 'vue'

/**
 * What `<DateFieldRoot>` provides to its parts.
 */
type DateFieldContext = Omit<DateField, 'setDate'>

/**
 * Props of `<DateFieldRoot>`.
 */
type DateFieldRootProps = Readonly<{
  locale: string
  value?: Readonly<Date> | undefined
}>

const dateFieldContextKey: InjectionKey<DateFieldContext> = Symbol('DateFieldContext')

/**
 * Reads the field of the nearest `<DateFieldRoot>`.
 *
 * @returns The field of the nearest `<DateFieldRoot>`
 */
function useDateFieldContext(): DateFieldContext {
  // oxlint-disable-next-line unicorn/no-useless-undefined -- An explicit default stops Vue from warning about a missing injection
  const field = inject(dateFieldContextKey, undefined)
  if (field === undefined) {
    throw new Error('useDateFieldContext() must be used within <DateFieldRoot>')
  }
  return field
}

export { dateFieldContextKey, useDateFieldContext }
export type { DateFieldRootProps }
