# Zero-Cost Date Parsing: How datefield Replaces Locale Tables with the Browser

## The Problem Every Date Library Got Wrong

Every JavaScript date library ships its own parser. That parser needs to understand formats — `DD.MM.YYYY` for Germany, `MM/DD/YYYY` for the US, `YYYY/MM/DD` for Japan. To do that, it ships **locale data**: thousands of lines mapping languages to formats, numeral systems, calendar variants.

This is the single biggest contributor to bundle size in date libraries:

| Library | Parser + Locale Data | What you pay for |
|---------|---------------------|------------------|
| Moment.js | ~70KB min (230KB+ with all locales) | 537 locale definitions, format strings, regex parsers |
| date-fns | ~20KB parse + per-locale imports | Each `locale/` module adds format rules to your bundle |
| Luxon | ~20KB | Format tables, token maps, regex patterns |
| Day.js | ~7KB + plugins | Plugin chain: customParseFormat, localizedFormat, etc. |
| **datefield** | **~3 KB gzip** | **No locale data.** |

The irony? **Your browser already has all this data.** Every browser ships ICU — the International Components for Unicode — a comprehensive locale database that handles every country, calendar system, and numeral system on earth. It's exposed through `Intl.DateTimeFormat`.

Every parser before us tried to replicate what the browser already knows. We just ask it.

## How It Works

### One function. One line. Every locale.

```typescript
import { deriveFormat } from "datefield";

const format = deriveFormat("de-CH");
// → [day, ".", month, ".", year]

const format = deriveFormat("en-US");
// → [month, "/", day, "/", year]

const format = deriveFormat("ko-KR");
// → [year, ". ", month, ". ", day, "."]
```

Or let the browser decide based on the user's system locale:

```typescript
const format = deriveFormat(navigator.language);
```

No configuration. No imports. No locale packages. The browser tells us: "this locale puts the day first, uses dots as separators, and the year has 4 digits." We remember that structure. Done.

### Under the hood

```typescript
// This is the entire "parser" for understanding locale formats:
const fmt = new Intl.DateTimeFormat(locale, {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

fmt.formatToParts(referenceDate);
// → [
//   { type: "day",     value: "13" },
//   { type: "literal", value: "." },
//   { type: "month",   value: "11" },
//   { type: "literal", value: "." },
//   { type: "year",    value: "2026" },
// ]
```

`formatToParts()` is the most underrated API in the browser. It doesn't just format a date — it tells you the **structure** of the format. Segment order, separator characters, value lengths. Everything we need to parse user input back.

### Parsing user input

Once we know the structure, parsing is just slicing strings by known lengths:

```typescript
import { deriveFormat, parseSegments, toDate } from "datefield";

const format = deriveFormat("de-CH");      // Know the structure
const segments = parseSegments(format, "31.03.2026");  // Slice by lengths
const date = toDate(segments);             // → Date(2026, 2, 31)
```

No regex. No backtracking. No ambiguity. We know exactly where each segment starts and ends because the browser told us.

## Stress-Tested Across the World

We tested `deriveFormat` against **275 locales across 180+ countries**. Every continent. Every major language. Every edge case the browser throws at us.

### The Edge Cases We Handle

**Multi-character separators:**
```
Czech:    13. 11. 2026    (dot + space)
Croatian: 13. 11. 2026.   (dot + space + trailing dot)
```

**Trailing literals:**
```
Bulgarian: 13.11.2026 г.   (Cyrillic year suffix)
Serbian:   13.11.2026.     (trailing dot)
Korean:    2026. 11. 13.   (year first + trailing dot)
```

**CJK formats:**
```
Chinese (SG): 2026年11月13日  (year/month/day with Kanji suffixes)
```

**RTL separators:**
```
Arabic: 13‏/11‏/2026  (with invisible RTL marks)
```

**Non-Gregorian calendars:**
```
Thai:    Buddhist calendar → forced to Gregorian
Persian: Solar Hijri      → forced to Gregorian
```

All handled. Zero special cases in our code. We force Gregorian calendar and Latin numerals in `deriveFormat`, then let the browser handle locale-specific ordering and separators.

### Global Coverage

| Segment Order | Locales | % | Regions |
|--------------|---------|---|---------|
| Day-Month-Year | 227 | 82% | Europe, Latin America, Africa, Middle East, South/SE Asia |
| Year-Month-Day | 31 | 11% | East Asia, Scandinavia, Canada, some African languages |
| Month-Day-Year | 17 | 6% | USA, Philippines, and a few indigenous languages |

## The Segmented Date Input

`datefield` isn't just a parser — it's a complete engine for building date input fields. The kind where you click on the day, press arrow-up, and it rotates. Press Tab, and it moves to the month. Editing runs on [`gap-buffer`](../../gap-buffer), so correcting one digit never shifts the rest of the date.

```typescript
import {
  deriveFormat,
  fromDate,
  nextSegment,
  previousSegment,
  segmentAtPosition,
  inputDigit,
  rotateSegment,
  toDate,
} from "datefield";

// Derive format from user's locale
const format = deriveFormat(navigator.language);

// Convert a date to editable segments
const segments = fromDate(new Date(), format);

// Arrow Up on the day segment: 31 → 01, the month stays untouched
const updated = rotateSegment(segments, 0, 1);

// Navigate between segments (skips separators)
const monthIndex = nextSegment(segments, 0); // day → month

// User types "3" into the day segment
const { segments: typed, activeIndex } = inputDigit(segments, 0, "3");

// Convert back to a Date
const date = toDate(segments);
```

All pure functions. No DOM. No React. No state. Wire them to your framework of choice in ~20 lines.

### Rotation that never destroys the date

`rotateSegment` wraps a segment within its own range and never carries into the next one:

- Day 31 → 01 keeps the month; month 12 → 01 keeps the year
- The day range follows the real month length (30.04 → 01.04, 29.02 only in leap years)
- Changing the month or year clamps the day: 31.01 → month up → 28.02
- An empty segment starts like a native date input (up → minimum, down → maximum)

No hardcoded `Math.min(day + 1, 31)` like traditional date inputs.

## The Architecture

```
┌─────────────────────────────────────────────┐
│  Browser (Intl.DateTimeFormat)              │
│  "de-CH formats dates as DD.MM.YYYY"        │
└──────────────────┬──────────────────────────┘
                   │ formatToParts()
                   ▼
┌─────────────────────────────────────────────┐
│  datefield                                  │
│                                             │
│  deriveFormat()  → format structure          │
│  parseSegments() → typed segments            │
│  toDate()        → Date object              │
│  fromDate()      → segments from Date        │
│  rotateSegment() → arrow up/down            │
│  navigate()      → arrow left/right          │
│  inputDigit()    → keyboard typing          │
└──────────────────┬──────────────────────────┘
                   │ pure functions
                   ▼
┌─────────────────────────────────────────────┐
│  Your framework (React/Vue/Svelte)          │
│  ~20 lines to wire segments to DOM events   │
└─────────────────────────────────────────────┘
```

## Why This Matters

### Bundle size is a feature

Every KB of JavaScript delays your app's time-to-interactive. Date parsers are often the largest dependency in form-heavy applications. Shipping 70KB of Moment.js so users can type a date into a form was always absurd — we just didn't have a better option.

Now we do. About 3 KB gzipped, zero dependencies besides gap-buffer. The browser does the rest.

### Locale correctness is not optional

Hardcoding `DD/MM/YYYY` and calling it "international" ignores 275 locale variations. Real applications serve real users in Bulgaria (trailing `г.`), Czech Republic (dot-space separators), Korea (year-first with trailing dots), and dozens of other formats that don't fit neat patterns.

`deriveFormat(navigator.language)` handles all of them. Automatically. Correctly.

### The best code is the code you don't write

We didn't build a parser. We built a thin bridge to the parser that already ships with every browser. That means:

- **Zero maintenance** for locale data — browser vendors update ICU
- **Zero bugs** in format detection — battle-tested by billions of users
- **Zero bundle cost** for locale support — it's already on the device

The most reliable parser is the one you delegate to the platform.

## Get Started

```bash
npm install datefield
```

```typescript
import { deriveFormat, parseSegments, toDate } from "datefield";

const format = deriveFormat(navigator.language);

// Parse user input
const segments = parseSegments(format, userInput);
const date = toDate(segments);

// That's it. Every locale. 0 KB locale data.
```
