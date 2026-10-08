# Minuta

**Divide time into pieces.**

A pure functional calendar library. 4.7 kB gzipped. Zero dependencies. Swap date engines without changing your code.

```typescript
import { derivePeriod, divide } from "minuta";
import { createNativeAdapter } from "minuta/native";

const adapter = createNativeAdapter({ weekStartsOn: 1 });

const year = derivePeriod(adapter, new Date(), "year");
const months = divide(adapter, year, "month"); // 12 periods
const days = divide(adapter, months[0], "day"); // 31 periods
const hours = divide(adapter, days[0], "hour"); // 24 periods
```

## Packages

| Package              | Description                          |
| -------------------- | ------------------------------------ |
| `minuta`             | Core operations + types              |
| `minuta/native`      | Zero-dep adapter (built-in Date)     |
| `minuta/date-fns`    | date-fns adapter                     |
| `minuta/date-fns-tz` | Timezone-aware adapter               |
| `minuta/luxon`       | Luxon adapter                        |
| `minuta/temporal`    | TC39 Temporal adapter                |
| `minuta/calendar`    | Calendar grid utilities              |
| `minuta/helpers`     | UI helpers (isWeekend, isToday, ...) |
| `minuta/format`      | Locale-aware period labels           |
| `minuta-vue`         | Vue 3 integration                    |
| `minuta-react`       | React 18+ integration                |
| `datefield`          | Headless segmented date input        |
| `gap-buffer`         | Fixed-slot input buffer with gaps    |

## Documentation

See [packages/minuta/README.md](packages/minuta/README.md) for the full API.

## License

Apache-2.0
