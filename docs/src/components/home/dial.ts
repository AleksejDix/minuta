/**
 * The home page's dial: the year's months, the month's days and the day's
 * hours as rings, made with minuta's own `period`, `divide` and `contains`,
 * with a second hand sweeping over them.
 */
import { contains, divide, period } from "minuta";
import type { Period } from "minuta";

type Ring = Readonly<{
  /** Degrees left empty between two pieces */
  gap: number;
  /** Class of the ring, for its stroke width */
  name: string;
  pieces: readonly Period[];
  radius: number;
}>;

const CENTER = 220;
const FULL_TURN = 360;
const QUARTER_TURN = 90;
const HALF_TURN = 180;
const RADIANS = Math.PI / HALF_TURN;
const MONTH_RADIUS = 178;
const DAY_RADIUS = 150;
const HOUR_RADIUS = 124;
const LABEL_RADIUS = 204;
const SECOND_RADIUS = 104;
const SECOND_SIZE = 5;
const MONTH_GAP = 1.8;
const DAY_GAP = 1;
const HOUR_GAP = 1.4;
const DECIMALS = 2;
const HALF = 2;
const TEXT_LINE = 36;
const MS_A_MINUTE = 60_000;
const MS_A_SECOND = 1000;
const ONE = 1;

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

type Coordinates = Readonly<{ across: string; down: string }>;

function coordinates(radius: number, degrees: number): Coordinates {
  const angle = (degrees - QUARTER_TURN) * RADIANS;
  return {
    across: (CENTER + radius * Math.cos(angle)).toFixed(DECIMALS),
    down: (CENTER + radius * Math.sin(angle)).toFixed(DECIMALS),
  };
}

function point(radius: number, degrees: number): string {
  const { across, down } = coordinates(radius, degrees);
  return `${across} ${down}`;
}

// An arc clockwise from `from` to `to` degrees, 0 at twelve o'clock
function arc(radius: number, from: number, to: number): string {
  const large = Number(to - from > HALF_TURN);
  return `M ${point(radius, from)} A ${String(radius)} ${String(radius)} 0 ${String(large)} 1 ${point(radius, to)}`;
}

function state(piece: Period, now: Readonly<Date>): string {
  if (contains(piece, now)) {
    return "now";
  }
  if (piece.end < now) {
    return "past";
  }
  return "future";
}

function ringMarkup(ring: Ring, now: Readonly<Date>): string {
  const step = FULL_TURN / ring.pieces.length;
  return ring.pieces
    .map((piece, index) => {
      const from = index * step + ring.gap / HALF;
      const to = (index + ONE) * step - ring.gap / HALF;
      return `<path class="dial-${ring.name} dial-${state(piece, now)}" style="--i:${String(index)}" pathLength="1" d="${arc(ring.radius, from, to)}"/>`;
    })
    .join("");
}

function labelsMarkup(months: readonly Period[]): string {
  const letter = new Intl.DateTimeFormat("en-US", { month: "narrow" });
  const step = FULL_TURN / months.length;
  return months
    .map((month, index) => {
      const { across, down } = coordinates(
        LABEL_RADIUS,
        index * step + step / HALF
      );
      return `<text class="dial-label" x="${across}" y="${down}">${letter.format(month.start)}</text>`;
    })
    .join("");
}

function centerMarkup(now: Readonly<Date>): string {
  const monthYear = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  });
  return `<text class="dial-date" x="${String(CENTER)}" y="${String(CENTER)}">${String(now.getDate())}</text>
<text class="dial-caption" x="${String(CENTER)}" y="${String(CENTER + TEXT_LINE)}">${monthYear.format(now)}</text>
<text class="dial-time" x="${String(CENTER)}" y="${String(CENTER + TEXT_LINE * HALF)}"></text>`;
}

function rings(now: Readonly<Date>): Ring[] {
  const year = period(now, "year");
  return [
    {
      gap: MONTH_GAP,
      name: "month",
      pieces: divide(year, "month"),
      radius: MONTH_RADIUS,
    },
    {
      gap: DAY_GAP,
      name: "day",
      pieces: divide(period(now, "month"), "day"),
      radius: DAY_RADIUS,
    },
    {
      gap: HOUR_GAP,
      name: "hour",
      pieces: divide(period(now, "day"), "hour"),
      radius: HOUR_RADIUS,
    },
  ];
}

function dialMarkup(now: Readonly<Date>): string {
  const all = rings(now);
  const label = new Intl.DateTimeFormat("en-US", { dateStyle: "full" }).format(
    now
  );
  return `<svg viewBox="0 0 ${String(CENTER * HALF)} ${String(CENTER * HALF)}" role="img" aria-label="A dial of ${label}: the year's months, this month's days and today's hours">
${all.map((ring) => ringMarkup(ring, now)).join("")}
${labelsMarkup(divide(period(now, "year"), "month"))}
<circle class="dial-track" cx="${String(CENTER)}" cy="${String(CENTER)}" r="${String(SECOND_RADIUS)}"/>
<circle class="dial-hand" cx="${String(CENTER)}" cy="${String(CENTER - SECOND_RADIUS)}" r="${String(SECOND_SIZE)}"/>
${centerMarkup(now)}
</svg>`;
}

// Degrees of the second hand for a moment: a full turn every minute
function handAngle(now: Readonly<Date>, smooth: boolean): number {
  const intoMinute = now.getTime() % MS_A_MINUTE;
  if (smooth) {
    return (intoMinute / MS_A_MINUTE) * FULL_TURN;
  }
  return (
    Math.floor(intoMinute / MS_A_SECOND) *
    (FULL_TURN / (MS_A_MINUTE / MS_A_SECOND))
  );
}

function tick(root: HTMLElement, smooth: boolean): void {
  const now = new Date();
  const hand = root.querySelector(".dial-hand");
  if (hand !== null) {
    hand.setAttribute(
      "transform",
      `rotate(${handAngle(now, smooth).toFixed(DECIMALS)} ${String(CENTER)} ${String(CENTER)})`
    );
  }
  const time = root.querySelector(".dial-time");
  if (time !== null) {
    time.textContent = new Intl.DateTimeFormat("en-GB", {
      timeStyle: "medium",
    }).format(now);
  }
}

function animate(root: HTMLElement, smooth: boolean): void {
  let minute = Math.floor(Date.now() / MS_A_MINUTE);
  function frame(): void {
    const current = Math.floor(Date.now() / MS_A_MINUTE);
    if (current !== minute) {
      minute = current;
      root.innerHTML = dialMarkup(new Date());
      root.classList.add("is-drawn");
    }
    tick(root, smooth);
    if (smooth) {
      requestAnimationFrame(frame);
    }
  }
  frame();
  if (!smooth) {
    setInterval(frame, MS_A_SECOND);
  }
}

/**
 * Draw every dial on the page and keep it on time.
 */
function mountDials(): void {
  const smooth = !globalThis.matchMedia(REDUCED_MOTION).matches;
  for (const root of document.querySelectorAll<HTMLElement>("[data-dial]")) {
    root.innerHTML = dialMarkup(new Date());
    animate(root, smooth);
  }
}

export { mountDials };
