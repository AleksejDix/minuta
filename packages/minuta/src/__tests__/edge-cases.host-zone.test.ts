import { afterEach, describe, expect, it, vi } from "vitest";
import { divideWith, periodWith } from "#src/core";
import { dateFnsTzUnits } from "#src/date-fns-tz";
import { length } from "#src/operations/duration";

const MS_PER_HOUR = 3_600_000;
const TWENTY_THREE = 23;

/*
 * Computer zones that change their clocks at midnight on Mar 31 2024, the
 * night Europe springs forward. Node rereads `TZ` when it changes, so each
 * test runs as if the computer were there.
 */
const HOSTS: readonly string[] = ["Asia/Beirut", "Atlantic/Azores", "UTC"];

const SPRING_FORWARD = new Date("2024-03-31T12:00:00Z");

describe("dateFnsTzUnits() ignores the computer's zone", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it.each(HOSTS)(
    "divides a Zurich spring-forward day into 23 hours in %s",
    { timeout: 5000 },
    (host) => {
      expect.hasAssertions();
      vi.stubEnv("TZ", host);
      const zurich = dateFnsTzUnits({ timeZone: "Europe/Zurich" });
      const day = periodWith(zurich, SPRING_FORWARD, "day");
      expect(day.start).toStrictEqual(new Date("2024-03-30T23:00:00Z"));
      expect(divideWith(zurich, day, "hour")).toHaveLength(TWENTY_THREE);
    }
  );

  /*
   * Upstream: @date-fns/tz 1.5.0 sets wall times with the built-in Date,
   * so London's midnight shifts by the hour Beirut skips at its own
   * midnight. See https://github.com/AleksejDix/minuta/issues/166
   */
  it.fails(
    "starts a London spring-forward day at midnight in Asia/Beirut",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      vi.stubEnv("TZ", "Asia/Beirut");
      const london = dateFnsTzUnits({ timeZone: "Europe/London" });
      const day = periodWith(london, SPRING_FORWARD, "day");
      expect(day.start).toStrictEqual(new Date("2024-03-31T00:00:00Z"));
      expect(length(day)).toBe(TWENTY_THREE * MS_PER_HOUR);
    }
  );
});
