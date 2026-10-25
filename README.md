# Minuta

**Divide time into pieces.**

A pure functional calendar library. Zero dependencies. Swap date engines without changing your code.

```typescript
import { divide, period } from "@aleksejdix/minuta";

const year = period(new Date(), "year");
const months = divide(year, "month"); // 12 periods
const days = divide(months[0], "day"); // 31 periods
const hours = divide(days[0], "hour"); // 24 periods
```

## Packages

| Package                          | Description                           |
| -------------------------------- | ------------------------------------- |
| `minuta`                         | Core operations, native units bound   |
| `@aleksejdix/minuta/native`      | Zero-dep adapter (built-in Date)      |
| `@aleksejdix/minuta/date-fns`    | date-fns adapter                      |
| `@aleksejdix/minuta/date-fns-tz` | Timezone-aware adapter                |
| `@aleksejdix/minuta/luxon`       | Luxon adapter                         |
| `@aleksejdix/minuta/temporal`    | TC39 Temporal adapter                 |
| `fechita`                        | Date parser for every CLDR locale     |
| `@aleksejdix/minuta/calendar`    | Calendar grids, weekdays and weekends |
| `@aleksejdix/minuta/intervals`   | Merge, split, clamp, snap and more    |
| `@aleksejdix/minuta/format`      | Locale-aware period labels            |
| `minuta-vue`                     | Vue 3 integration                     |
| `minuta-react`                   | React 18+ integration                 |
| `datefield`                      | Headless segmented date input         |
| `text-buffer`                    | Immutable text + selection model      |
| `input-state`                    | Masks + insert/overwrite modes        |
| `input-dom`                      | Vanilla DOM binding for inputs        |

## Documentation

See [packages/minuta/README.md](packages/minuta/README.md) for the full API.

## License

Apache-2.0
