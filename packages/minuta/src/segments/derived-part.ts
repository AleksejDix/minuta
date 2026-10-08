// Intl options and extraction for derived (display-only) segments

const DEFAULT_LOCALE = "en-US";
const NARROW_MAX_LENGTH = 2;
const SHORT_MAX_LENGTH = 3;
const DAY_PERIOD_SHORT_MAX_LENGTH = 4;
const TIME_ZONE_SHORT_MAX_LENGTH = 4;
const ONE_DIGIT = 1;
const TWO_DIGITS = 2;
const THREE_DIGITS = 3;

type Width = "narrow" | "short" | "long";

type FractionalDigits =
  | typeof ONE_DIGIT
  | typeof TWO_DIGITS
  | typeof THREE_DIGITS;

const FRACTIONAL_DIGITS: ReadonlySet<number> = new Set<number>([
  ONE_DIGIT,
  TWO_DIGITS,
  THREE_DIGITS,
]);

function isFractionalDigits(length: number): length is FractionalDigits {
  return FRACTIONAL_DIGITS.has(length);
}

function widthFor(length: number, narrowMax: number, shortMax: number): Width {
  if (length <= narrowMax) {
    return "narrow";
  }
  if (length <= shortMax) {
    return "short";
  }
  return "long";
}

function fractionalSecondOptions(length: number): Intl.DateTimeFormatOptions {
  if (!isFractionalDigits(length)) {
    throw new RangeError("fractionalSecondDigits value is out of range.");
  }
  return { fractionalSecondDigits: length };
}

function derivedOptions(
  type: string,
  length: number
): Intl.DateTimeFormatOptions | undefined {
  switch (type) {
    case "era": {
      return { era: widthFor(length, NARROW_MAX_LENGTH, SHORT_MAX_LENGTH) };
    }
    case "weekday": {
      return { weekday: widthFor(length, NARROW_MAX_LENGTH, SHORT_MAX_LENGTH) };
    }
    case "dayPeriod": {
      return {
        dayPeriod: widthFor(
          length,
          NARROW_MAX_LENGTH,
          DAY_PERIOD_SHORT_MAX_LENGTH
        ),
        hour: "numeric",
        hour12: true,
      };
    }
    case "fractionalSecond": {
      return fractionalSecondOptions(length);
    }
    case "timeZoneName": {
      if (length <= TIME_ZONE_SHORT_MAX_LENGTH) {
        return { timeZoneName: "short" };
      }
      return { timeZoneName: "long" };
    }
    default: {
      return undefined;
    }
  }
}

type DerivedPartInput = {
  readonly date: Readonly<Date>;
  readonly length: number;
  readonly locale: string | undefined;
  readonly type: string;
};

function extractDerivedPart(input: DerivedPartInput): string {
  const { date, length, locale = DEFAULT_LOCALE, type } = input;
  const opts = derivedOptions(type, length);
  if (opts === undefined) {
    return "";
  }

  const fmt = new Intl.DateTimeFormat(locale, opts);
  const part = fmt
    .formatToParts(date)
    .find((item: Readonly<Intl.DateTimeFormatPart>) => item.type === type);
  if (part === undefined) {
    return "";
  }
  return part.value;
}

export { extractDerivedPart };
