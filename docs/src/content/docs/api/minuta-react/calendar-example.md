---
title: CalendarExample
description: A ready-made React month calendar built from the calendar parts, with a toggle for the first day of the week.
---

A ready-made month calendar, built from the calendar parts, with a toggle that
switches the first day of the week between Sunday and Monday. Use it to try
the library, or read it as a template for your own calendar.

```js
import { CalendarExample } from "minuta-react/components";
// also exported from "minuta-react"
```

```jsx
<CalendarExample onSelect={(day) => …} />
```

## Example

```jsx
import { CalendarExample } from "minuta-react";

export function App() {
  return (
    <CalendarExample onSelect={(day) => alert(day.start.toDateString())} />
  );
}
```

It renders a title ("Minuta React Demo"), a "Week starts on" toggle with
"Sunday" and "Monday" buttons, a [`CalendarHeader`](../calendar-header/) and a
[`CalendarGrid`](../calendar-grid/) for the current month. Clicking a day
shows its date.

## Props

| Name       | What it is                                                           | Default |
| ---------- | -------------------------------------------------------------------- | ------- |
| `onSelect` | Called with the day [period](../../minuta/period/) the user selects. | —       |

## How it works

It is a [`CalendarRoot`](../calendar-root/) with a header and a grid inside.
The week starts on Monday. The toggle builds new units with
`nativeUnits({ weekStartsOn })` and passes them to the root, so the weekday
row and the weeks move at once. The browsed month and the selection are kept.

The toggle buttons have the class `toggle`, and the active one also has
`is-active`. Like the other parts, it ships no styles.

## Related

- [`CalendarRoot`](../calendar-root/), [`CalendarHeader`](../calendar-header/),
  [`CalendarGrid`](../calendar-grid/) — the parts it is made of.
- [Overview](../overview/) — a smaller calendar to start from.
