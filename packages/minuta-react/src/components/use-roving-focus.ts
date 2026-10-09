import { useCallback, useMemo, useRef, useState } from "react";
import type { Period } from "minuta/core";
import { useMinutaContext } from "#src/minuta-context";

type RovingFocus = Readonly<{
  /** Move the keyboard focus to a day, browsing to its month */
  focus: (day: Period) => void;
  /** The last focused day */
  focused: Period | undefined;
  /** Remember a day as focused without moving the focus */
  remember: (day: Period) => void;
  /** Whether the keyboard moved the focus to `day`; true only once */
  takeFocus: (day: Period) => boolean;
}>;

/**
 * The focused day of a calendar grid and the pending keyboard focus move,
 * which the day that becomes tabbable takes over.
 *
 * @returns The focused day and the functions that move it
 */
function useRovingFocus(): RovingFocus {
  const { browse, browsing, contains, same } = useMinutaContext();
  const [focused, setFocused] = useState<Period>();
  const request = useRef<Period>();

  const focus = useCallback(
    (day: Period) => {
      request.current = day;
      setFocused(day);
      if (!contains(browsing, day.start)) {
        browse(day);
      }
    },
    [browse, browsing, contains]
  );
  const takeFocus = useCallback(
    (day: Period) => {
      const requested = request.current;
      if (requested === undefined || !same(requested, day, "day")) {
        return false;
      }
      request.current = undefined;
      return true;
    },
    [same]
  );

  return useMemo(
    () => ({ focus, focused, remember: setFocused, takeFocus }),
    [focus, focused, takeFocus]
  );
}

export { useRovingFocus };
