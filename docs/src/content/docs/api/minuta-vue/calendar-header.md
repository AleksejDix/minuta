---
title: CalendarHeader
description: A Vue component that shows the browsed month between "previous month" and "next month" buttons.
---

A component that shows the name of the browsed month between a "previous
month" and a "next month" button.

```js
import { CalendarHeader } from "minuta-vue/components";
```

```vue
<CalendarHeader locale="de-CH" />
```

## Example

```vue
<script setup>
import {
  CalendarGrid,
  CalendarHeader,
  CalendarRoot,
} from "minuta-vue/components";
</script>

<template>
  <CalendarRoot :date="new Date(2024, 2, 13)">
    <CalendarHeader locale="de-CH" />
    <CalendarGrid locale="de-CH" />
  </CalendarRoot>
</template>
```

The heading reads "März 2024". "← Previous" shows February 2024, "Next →"
shows April 2024.

## Props

| Name     | What it is                                   | Default   |
| -------- | -------------------------------------------- | --------- |
| `locale` | The language of the month name, e.g. `"fr"`. | `"en-US"` |

It has no slots and emits no events.

The month name is written in the time zone of the units
(`units.timeZone`), so time-zone units show the month of that zone.

The button texts ("← Previous", "Next →") are fixed and not translated by
`locale`.

## Accessibility

- The buttons are named "Previous month" and "Next month" for screen readers
  (`aria-label`).
- The heading is an `<h2>` with `aria-live="polite"`, so screen readers
  announce the new month after a click.
- The heading labels the grid: [`CalendarGrid`](../calendar-grid/) points to
  it with `aria-labelledby`.

## What it renders

```html
<div class="calendar-header">
  <button class="nav-button" aria-label="Previous month">← Previous</button>
  <h2 aria-live="polite">March 2024</h2>
  <button class="nav-button" aria-label="Next month">Next →</button>
</div>
```

The elements also carry `data-testid` attributes (`calendar-previous`,
`calendar-label`, `calendar-next`) for tests. With `minuta-vue/style.css`
imported, the header is a flex row with dark buttons.

## Errors

Outside a [`CalendarRoot`](../calendar-root/) — even inside a plain
`MinutaRoot` — it throws `Calendar parts must be used within <CalendarRoot>`.

## Related

- [`CalendarRoot`](../calendar-root/) — holds the browsed month.
- [`CalendarGrid`](../calendar-grid/) — the days of the month.
