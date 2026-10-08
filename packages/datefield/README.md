# datefield

Headless logic for segmented date inputs (`DD.MM.YYYY`, `MM/DD/YYYY`, …).
Locale formats come from `Intl.DateTimeFormat`, so there is no locale data to
ship. The format becomes an [`input-state`](../input-state) mask: typing
overwrites slots, so correcting one digit never shifts the rest of the date.

```bash
npm install datefield input-state
```

```typescript
import { createInputState, typeChar } from "input-state";
import {
  clampDay,
  dateMask,
  deriveFormat,
  parseSegments,
  rotateSegment,
  segmentAtPosition,
  toDate,
  withSegments,
} from "datefield";

const format = deriveFormat(navigator.language); // de-CH → __.__.____
let field = createInputState({ mask: dateMask(format) });

// Typing: overwrite mode with a mask, nothing shifts
field = typeChar(field, "3");

// Keep the day valid after every edit (31.02 → 28.02)
field = withSegments(field, clampDay(parseSegments(format, field.buffer.text)));

// Arrow up on the segment under the cursor: wraps, never carries
const segments = parseSegments(format, field.buffer.text);
const index = segmentAtPosition(segments, field.buffer.selection.head);
field = withSegments(field, rotateSegment(segments, index, 1));

const date = toDate(parseSegments(format, field.buffer.text)); // undefined until valid
```

## Behaviour

- `rotateSegment` wraps within the segment (day 31 → 01 keeps the month) and
  uses the real month length; month and year changes clamp the day.
- `clampDay` keeps the day valid after any month/year edit (31.02 → 28.02).
- `toDate` returns `undefined` while a slot is empty or the date is invalid,
  without touching what the user typed.
- `dateMask` rejects display-only parts (weekday, era) — they cannot be typed.

See [docs/zero-cost-parsing.md](docs/zero-cost-parsing.md) for the design and
[docs/date-formats.md](docs/date-formats.md) for formats by country.

## License

Apache-2.0
