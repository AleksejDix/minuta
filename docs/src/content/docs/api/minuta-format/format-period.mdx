---
title: formatPeriod
description: Turn a period into a label in any language — "March 2026", "15. März 2026", "Mar 9 – 15, 2026" — picked by the period's unit.
---

Turn a period into a label for people to read, in any language: "March
2026", "15. März 2026", "Mar 9 – 15, 2026". The format is picked by the
period's unit.

```ts
import { formatPeriod } from "minuta/format";
```

```ts
formatPeriod(period, locale, options?)
```

## Example

```ts
import { formatPeriod } from "minuta/format";
import { period } from "minuta";

const date = new Date(2026, 2, 15, 14, 5, 9);

formatPeriod(period(date, "month"), "en-US"); // → "March 2026"
formatPeriod(period(date, "month"), "de-CH"); // → "März 2026"
formatPeriod(period(date, "day"), "en-US"); // → "March 15, 2026"
formatPeriod(period(date, "week"), "en-US"); // → "Mar 9 – 15, 2026"
```

## Parameters

| Name      | What it is                                                                                            |
| --------- | ----------------------------------------------------------------------------------------------------- |
| `period`  | The period to label.                                                                                  |
| `locale`  | The language and region, as a BCP 47 tag: `"en-US"`, `"de-CH"`, `"ja-JP"`, …                          |
| `options` | Optional. `Intl.DateTimeFormat` options that replace or add to the defaults, see [Options](#options). |

## Returns

The label, a string. It is made by the browser's or Node's built-in
`Intl.DateTimeFormat`, so minuta ships no language data.

## One format per unit

The unit of the period decides what the label shows. For Sun Mar 15 2026,
14:05:09:

| Unit      | `"en-US"`          | `"de-CH"`          | `"ja-JP"`              |
| --------- | ------------------ | ------------------ | ---------------------- |
| `year`    | 2026               | 2026               | 2026年                 |
| `quarter` | Jan 2026           | Jan. 2026          | 2026年1月              |
| `month`   | March 2026         | März 2026          | 2026年3月              |
| `week`    | Mar 9 – 15, 2026   | 9.–15. März 2026   | 2026/03/09～2026/03/15 |
| `day`     | March 15, 2026     | 15. März 2026      | 2026年3月15日          |
| `hour`    | Mar 15, 2:00 PM    | 15. März, 14:00    | 3月15日 14:00          |
| `minute`  | Mar 15, 2:05 PM    | 15. März, 14:05    | 3月15日 14:05          |
| `second`  | Mar 15, 2:05:09 PM | 15. März, 14:05:09 | 3月15日 14:05:09       |

Weeks and `"custom"` periods are shown as a range from start to end, the
same as [`formatRange`](../format-range/). All other units show their start.

```ts
import { range } from "minuta";

formatPeriod(range(new Date(2026, 2, 30), new Date(2026, 3, 5)), "en-US");
// → "Mar 30 – Apr 5, 2026"
```

## Quarters show their first month

A quarter is labelled with the month it starts in, which may not be what you
want: Q2 2026 becomes "Apr 2026". Use `formatRange` to show all three
months:

```ts
import { formatRange } from "minuta/format";

const q2 = period(new Date(2026, 4, 1), "quarter");

formatPeriod(q2, "en-US"); // → "Apr 2026"
formatRange(q2, "en-US"); // → "Apr – Jun 2026"
```

## Options

`options` are the options of
[`Intl.DateTimeFormat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat#options).
They are merged over the defaults of the period's unit: what you pass wins,
the rest stays.

```ts
formatPeriod(period(date, "month"), "en-US", { month: "short" });
// → "Mar 2026"

formatPeriod(period(date, "day"), "en-US", { weekday: "long" });
// → "Sunday, March 15, 2026"
```

:::caution
`dateStyle` and `timeStyle` cannot be mixed with the default fields such as
`month` or `day`. `formatPeriod(day, "en-US", { dateStyle: "full" })` throws
a `TypeError` from `Intl.DateTimeFormat`. Use the single fields instead.
:::

## Time zones

The label is written in the time zone of the computer unless you say
otherwise. Periods made with zone-aware units, such as `dateFnsTzUnits`,
must be formatted in that zone. Pass the units' `timeZone`:

```ts
import { dateFnsTzUnits } from "minuta/date-fns-tz";
import { periodWith } from "minuta/core";

const tokyo = dateFnsTzUnits({ timeZone: "Asia/Tokyo" });
const day = periodWith(tokyo, new Date("2026-03-20T20:00:00Z"), "day");

formatPeriod(day, "en-US", { timeZone: tokyo.timeZone }); // → "March 21, 2026"
formatPeriod(day, "en-US"); // → "March 20, 2026" on a computer in Zurich (wrong)
```

## Other calendars

The locale can ask for another calendar system with `-u-ca-`. Only the label
changes; the period is still the same Gregorian month.

```ts
formatPeriod(period(date, "month"), "en-US-u-ca-buddhist"); // → "March 2569 BE"
```

In a locale whose calendar has other month borders, the label is the
month of the period's **start**: for March 2026, `"fa-IR"` gives
"۱۴۰۴ اسفند", the Persian month in which March 1 falls.

## Custom units

A period with a unit minuta has no format for (a unit you added yourself) is
labelled like a `"custom"` date, but only with its start:
"Mar 1, 2026". Use `formatRange` to show start and end.

## Errors

`formatPeriod` throws the errors of `Intl.DateTimeFormat`:

| Error        | When                                                              |
| ------------ | ----------------------------------------------------------------- |
| `RangeError` | `locale` is not a valid tag, or the period holds an invalid Date. |
| `TypeError`  | `options` conflict with the defaults, e.g. `dateStyle`.           |

## Related

- [`formatRange`](../format-range/) — always show the period as start – end.
- [`period`](../../minuta/period/) — make the period to label.
- [Time zones](../../../concepts/time-zones/) — format zone-aware periods correctly.
