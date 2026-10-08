# datefield

Headless logic for segmented date inputs (`DD.MM.YYYY`, `MM/DD/YYYY`, …).
Locale formats come from `Intl.DateTimeFormat`, so there is no locale data to
ship. Editing runs on [`gap-buffer`](../gap-buffer): correcting one digit never
shifts the rest of the date.

```bash
npm install datefield gap-buffer
```

```typescript
import { GapBuffer, REGEXP_ONLY_DIGITS } from "gap-buffer";
import {
  clampDay,
  deriveFormat,
  fromSlots,
  rotateSegment,
  toDate,
  toSlots,
} from "datefield";

const format = deriveFormat(navigator.language); // de-CH → DD.MM.YYYY

// Typing: the gap buffer overwrites one slot, nothing shifts
let buffer = new GapBuffer({ maxLength: 8, pattern: REGEXP_ONLY_DIGITS });
buffer = buffer.insertAt(buffer.cursor, "3");

// Display + validation: map the slots onto the locale format
const segments = clampDay(fromSlots(format, buffer.toString()));
const date = toDate(segments); // undefined until complete and valid

// Arrow up on the month: wraps 12 → 01 and keeps the year
const rotated = rotateSegment(segments, 2, 1);
buffer = buffer.setValue(toSlots(rotated));
```

## Behaviour

- `rotateSegment` wraps within the segment (day 31 → 01 keeps the month) and
  uses the real month length; month and year changes clamp the day.
- `clampDay` keeps the day valid after any month/year edit (31.02 → 28.02).
- `toDate` returns `undefined` while a segment has a gap or the date is invalid,
  without touching what the user typed.

See [docs/zero-cost-parsing.md](docs/zero-cost-parsing.md) for the design and
[docs/date-formats.md](docs/date-formats.md) for formats by country.

## License

Apache-2.0
