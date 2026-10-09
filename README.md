# Minuta

**Divide time into pieces.**

A pure functional calendar library. Zero dependencies. Swap date engines without changing your code.

```typescript
import { divide, period } from "minuta";

const year = period(new Date(), "year");
const months = divide(year, "month"); // 12 periods
const days = divide(months[0], "day"); // 31 periods
const hours = divide(days[0], "hour"); // 24 periods
```

## Packages

| Package              | Description                           |
| -------------------- | ------------------------------------- |
| `minuta`             | Core operations, native units bound   |
| `minuta/native`      | Zero-dep adapter (built-in Date)      |
| `minuta/date-fns`    | date-fns adapter                      |
| `minuta/date-fns-tz` | Timezone-aware adapter                |
| `minuta/luxon`       | Luxon adapter                         |
| `minuta/temporal`    | TC39 Temporal adapter                 |
| `fechita`            | Date parser for every CLDR locale     |
| `minuta/calendar`    | Calendar grids, weekdays and weekends |
| `minuta/intervals`   | Merge, split, clamp, snap and more    |
| `minuta/format`      | Locale-aware period labels            |
| `minuta-vue`         | Vue 3 integration                     |
| `minuta-react`       | React 18+ integration                 |
| `datefield`          | Headless segmented date input         |
| `text-buffer`        | Immutable text + selection model      |
| `input-state`        | Masks + insert/overwrite modes        |
| `input-dom`          | Vanilla DOM binding for inputs        |

## Documentation

See [packages/minuta/README.md](packages/minuta/README.md) for the full API.

## License

Apache-2.0
