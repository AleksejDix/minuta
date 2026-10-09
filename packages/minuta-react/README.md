# minuta-react

React bindings for [`minuta`](https://github.com/AleksejDix/minuta/tree/master/packages/minuta):
a hook that binds every operation to your units and keeps the browsed period
in React state, a context root, and composable calendar parts.

```bash
npm install minuta minuta-react
```

## `useMinuta(options?)`

```tsx
import { useMinuta } from "minuta-react";

function MonthPager() {
  const minuta = useMinuta({ unit: "month" });
  return (
    <button onClick={() => minuta.browse(minuta.next(minuta.browsing))}>
      {minuta.browsing.start.toDateString()}
    </button>
  );
}
```

Options (all optional):

- `units` – unit specs, default `nativeUnits()` (weeks start on Monday). The
  week start lives in the units: `nativeUnits({ weekStartsOn: "sunday" })`. Memoise
  them (`useMemo`) so the operations are rebound only when they change.
- `date` – initially browsed date, default now
- `now` – the moment that counts as "now", default the clock, re-read at the
  start of every new day so "today" never goes stale
- `unit` – unit of the browsed period, default `"month"`

Returns every operation of `withUnits(units)` (`period`, `next`, `previous`,
`shift`, `divide`, `contains`, `same`, …; see the core README) plus:

- `units` – the bound units
- `browsing: Period` – the browsed period of `unit`
- `now: Period` – the second containing `now`
- `browse(period)` – browse to the period of `unit` containing `period.start`

## `MinutaRoot`, `useMinutaContext()`, `usePeriod(unit)`

`MinutaRoot` calls `useMinuta(props)` and provides the result; parts read it
with `useMinutaContext()`, which throws outside a `MinutaRoot`.
`usePeriod(unit)` is the period of `unit` containing the browsed period's
start.

```tsx
import { MinutaRoot, useMinutaContext, usePeriod } from "minuta-react";

function Year() {
  const year = usePeriod("year");
  return <h2>{year.start.getFullYear()}</h2>;
}

function NextMonth() {
  const { browse, browsing, next } = useMinutaContext();
  return <button onClick={() => browse(next(browsing))}>Next</button>;
}

<MinutaRoot unit="month">
  <Year />
  <NextMonth />
</MinutaRoot>;
```

## Calendar parts (`minuta-react/components`)

Flat, composable parts that read the context of `CalendarRoot`:

```tsx
import {
  CalendarDay,
  CalendarGrid,
  CalendarHeader,
  CalendarRoot,
} from "minuta-react/components";
import { isWeekendWith } from "minuta/calendar";
import { nativeUnits } from "minuta/native";

const sundayFirst = nativeUnits({ weekStartsOn: "sunday" });

<CalendarRoot
  units={sundayFirst}
  isDisabled={(day) => isWeekendWith(sundayFirst, day)}
  onSelect={(day) => console.log(day.start)}
>
  <CalendarHeader locale="de-CH" />
  <CalendarGrid locale="de-CH">
    {(day) => <CalendarDay day={day} locale="de-CH" />}
  </CalendarGrid>
</CalendarRoot>;
```

- `CalendarRoot` – props `units?`, `date?`, `onSelect?(day)`,
  `isDisabled?(day)`; a `MinutaRoot` browsing months plus the selected and
  the focused day. Disabled days stay focusable but can't be selected
- `CalendarHeader` – month label (`locale?`) with previous/next buttons
- `CalendarGrid` – the stable 42-day month grid as a table with
  `role="grid"`, its weekday header row (`CalendarWeekdays`) included;
  `locale?` for the weekdays and the default days, `children` optionally
  renders each day (default `<CalendarDay day={day} locale={locale} />`)
- `CalendarWeekdays` – the grid's column headers in the week order of the
  units; rendered by `CalendarGrid`
- `CalendarDay` – one day (`locale?`): classes `is-outside`, `is-today`,
  `is-selected`, `is-disabled`; a click, Enter or Space selects it and
  browses to its month
- `CalendarExample` – the parts composed, with a Sunday/Monday toggle

All labels are formatted in the units' time zone (`units.timeZone`).

### Keyboard

The grid follows the
[WAI-ARIA date picker grid](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/).
Only one day is in the tab order: the last focused day of the browsed month,
else the selected day, else today, else the first of the month.

| Key                     | Moves the focus to                              |
| ----------------------- | ----------------------------------------------- |
| ArrowLeft / ArrowRight  | the previous / next day                         |
| ArrowUp / ArrowDown     | the same weekday of the previous / next week    |
| Home / End              | the first / last day of the week (units' start) |
| PageUp / PageDown       | the same day of the previous / next month       |
| Shift+PageUp / PageDown | the same day of the previous / next year        |
| Enter / Space           | selects the focused day                         |

A day missing from the target month is clamped to its last day (January 31
→ February 29). Moving the focus out of the browsed month browses there.

### Accessibility

- The grid is labelled by the month heading (`aria-labelledby`), which is
  announced politely (`aria-live="polite"`) when browsing changes it
- Column headers are `<th scope="col">` with the full weekday as `abbr`
- Each day is a button named with its full date ("Wednesday, January 17,
  2024"); its cell has `aria-selected`, today has `aria-current="date"`,
  disabled days have `aria-disabled="true"`
- The previous/next buttons are named "Previous month" and "Next month"

Custom `children` render inside the grid cells; render `CalendarDay` in them
to keep the keyboard navigation.

## Development

```bash
npm run dev --workspace=minuta-react
npm test --workspace=minuta-react
npm run type-check --workspace=minuta-react
```

## License

Apache 2.0 © Aleksej Dix
