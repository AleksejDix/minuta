---
title: CalendarDay
description: A React component that renders one day of the calendar as a button that selects the day and handles the arrow keys.
---

A component that renders one day as a button. A click, Enter or Space selects
the day; the arrow keys and Home, End, PageUp, PageDown move the focus.

```js
import { CalendarDay } from "minuta-react/components";
```

```jsx
<CalendarDay day={day} locale="en-US" />
```

## Example

[`CalendarGrid`](../calendar-grid/) renders a `CalendarDay` for every day by
default. Render it yourself to change the locale or to add something next to
it.

```jsx
import {
  CalendarDay,
  CalendarGrid,
  CalendarRoot,
} from "minuta-react/components";

export function FrenchCalendar() {
  return (
    <CalendarRoot date={new Date(2024, 0, 15)}>
      <CalendarGrid locale="fr">
        {(day) => <CalendarDay day={day} locale="fr" />}
      </CalendarGrid>
    </CalendarRoot>
  );
}
```

It shows January 2024 with French weekday names. The button of January 15
shows "15" and "lun.", and is named "lundi 15 janvier 2024" for screen
readers.

## Props

| Name     | What it is                                                                  | Default   |
| -------- | --------------------------------------------------------------------------- | --------- |
| `day`    | The day [period](../../minuta/period/) to show, as given by `CalendarGrid`. | —         |
| `locale` | The language of the number, the short weekday and the full date label.      | `"en-US"` |

All labels use the time zone of the units (`units.timeZone`).

## CSS classes

The button always has the class `day-cell`. These classes are added when they
apply:

| Class         | When                                                                       |
| ------------- | -------------------------------------------------------------------------- |
| `is-outside`  | The day is not in the browsed month (the grey days).                       |
| `is-today`    | The day contains "now".                                                    |
| `is-selected` | The day is the selected day.                                               |
| `is-disabled` | `isDisabled` of [`CalendarRoot`](../calendar-root/) returns `true` for it. |

Inside the button, `<span class="date-number">` holds the day number and
`<span class="weekday-label">` the short weekday. No styles ship with the
component.

```css
.day-cell.is-outside {
  opacity: 0.4;
}
.day-cell.is-selected {
  background: navy;
  color: white;
}
.day-cell .weekday-label {
  display: none;
}
```

## Behaviour

- **Click, Enter, Space** select the day, browse to its month and call
  `onSelect` of [`CalendarRoot`](../calendar-root/). A disabled day is not
  selected, but becomes the focused day.
- **Navigation keys** move the focus; see [Keyboard](../calendar-grid/#keyboard).
  They don't select anything. Other keys are left alone.
- **Tab order:** only one day in the grid has `tabindex="0"`, all others have
  `tabindex="-1"`.

## Accessibility

- The button is named with the full date (`aria-label`), e.g. "Wednesday,
  January 17, 2024".
- Today has `aria-current="date"`.
- A disabled day has `aria-disabled="true"`. It stays focusable, so keyboard
  users can still move past it.
- The `title` attribute holds the short weekday ("Wed").

## Errors

It must be inside a [`CalendarRoot`](../calendar-root/). Outside any root it
throws `useMinutaContext() must be used within <MinutaRoot>`; inside a plain
`MinutaRoot` it throws `Calendar parts must be used within <CalendarRoot>`.

## Related

- [`CalendarGrid`](../calendar-grid/) — renders the days and documents the keys.
- [`CalendarRoot`](../calendar-root/) — `onSelect` and `isDisabled`.
