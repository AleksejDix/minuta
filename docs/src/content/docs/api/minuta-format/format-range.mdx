---
title: formatRange
description: Show a period as "start – end" in any language, without repeating the month or year they share.
---

Show a period as "start – end" in any language. Parts that start and end
share, such as the month or the year, are written only once.

```ts
import { formatRange } from "minuta/format";
```

```ts
formatRange(period, locale, options?)
```

## Example

```ts
import { formatRange } from "minuta/format";
import { range } from "minuta";

formatRange(range(new Date(2026, 2, 1), new Date(2026, 2, 31)), "de-CH");
// → "1.–31. März 2026"

formatRange(range(new Date(2026, 2, 30), new Date(2026, 3, 5)), "de-CH");
// → "30. März – 5. Apr. 2026"

formatRange(range(new Date(2025, 11, 29), new Date(2026, 0, 4)), "de-CH");
// → "29. Dez. 2025 – 4. Jan. 2026"
```

## Parameters

| Name      | What it is                                                                                 |
| --------- | ------------------------------------------------------------------------------------------ |
| `period`  | The period to show, of any unit.                                                           |
| `locale`  | The language and region, as a BCP 47 tag: `"en-US"`, `"de-CH"`, …                          |
| `options` | Optional. `Intl.DateTimeFormat` options merged over the defaults, see [Options](#options). |

## Returns

The range as a string, made by the built-in
`Intl.DateTimeFormat#formatRange`.

## What is shown depends on the unit

The period's unit picks which fields are shown, the same as for
[`formatPeriod`](../format-period/#one-format-per-unit). `"custom"`
periods show day, short month and year. So a custom range shows only dates,
no times:

```ts
formatRange(
  range(new Date(2026, 2, 15, 9), new Date(2026, 2, 15, 17)),
  "en-US"
);
// → "Mar 15, 2026" (9:00 and 17:00 are not shown)

formatRange(
  range(new Date(2026, 2, 15, 9), new Date(2026, 2, 15, 17)),
  "en-US",
  {
    hour: "numeric",
    minute: "2-digit",
  }
);
// → "Mar 15, 2026, 9:00 AM – 5:00 PM"
```

## Start and end can collapse to one

When start and end look the same in the chosen fields, there is no dash at
all:

```ts
import { period } from "minuta";

formatRange(period(new Date(2026, 2, 1), "month"), "de-CH"); // → "März 2026"
formatRange(period(new Date(2026, 2, 15), "day"), "en-US"); // → "March 15, 2026"
formatRange(period(new Date(2026, 2, 15, 14), "hour"), "en-US"); // → "Mar 15, 2:00 – 2:59 PM"
formatRange(period(new Date(2026, 4, 1), "quarter"), "en-US"); // → "Apr – Jun 2026"
```

The hour shows its end as 2:59 because a period ends at its last
millisecond, 14:59:59.999.

## Options

Options are those of `Intl.DateTimeFormat`, merged over the defaults for the
unit. What you pass wins. Pass `timeZone` for periods of zone-aware units:

```ts
// `day` was made with `units = dateFnsTzUnits({ timeZone: "Asia/Tokyo" })`
formatRange(day, "en-US", { timeZone: units.timeZone });
```

See [`formatPeriod`](../format-period/#time-zones) for why.
`dateStyle` and `timeStyle` conflict with the defaults and throw a
`TypeError`.

## Errors

`formatRange` throws the errors of `Intl.DateTimeFormat`: a `RangeError` for
an invalid locale or an invalid Date, a `TypeError` for conflicting options.
It does not check the order: a period whose end is before its start is
formatted as it is.

## Related

- [`formatPeriod`](../format-period/) — a label that fits the unit: "March 2026".
- [`range`](../../minuta/range/) — make a period from two dates.
