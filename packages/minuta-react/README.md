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
  week start lives in the units: `nativeUnits({ weekStartsOn: 0 })`. Memoise
  them (`useMemo`) so the operations are rebound only when they change.
- `date` – initially browsed date, default now
- `now` – the moment that counts as "now", default `new Date()`
- `unit` – unit of the browsed period, default `"month"`

Returns every operation of `withUnits(units)` (`period`, `next`, `previous`,
`shift`, `divide`, `contains`, `same`, `isToday`, …; see the core README) plus:

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
  CalendarWeekdays,
} from "minuta-react/components";
import { nativeUnits } from "minuta/native";

const sundayFirst = nativeUnits({ weekStartsOn: 0 });

<CalendarRoot units={sundayFirst} onSelect={(day) => console.log(day.start)}>
  <CalendarHeader locale="de-CH" />
  <CalendarWeekdays locale="de-CH" />
  <CalendarGrid>{(day) => <CalendarDay day={day} />}</CalendarGrid>
</CalendarRoot>;
```

- `CalendarRoot` – props `units?`, `date?`, `onSelect?(day)`; a `MinutaRoot`
  browsing months plus the selected day
- `CalendarHeader` – month label (`locale?`) with previous/next buttons
- `CalendarWeekdays` – weekday labels in the week order of the units
- `CalendarGrid` – the stable 42-day month grid; `children` optionally
  renders each day (default `<CalendarDay day={day} />`)
- `CalendarDay` – one day: classes `is-outside`, `is-today`, `is-selected`;
  a click selects it and browses to its month
- `CalendarExample` – the parts composed, with a Sunday/Monday toggle

## Development

```bash
npm run dev --workspace=minuta-react
npm test --workspace=minuta-react
npm run type-check --workspace=minuta-react
```

## License

Apache 2.0 © Aleksej Dix
