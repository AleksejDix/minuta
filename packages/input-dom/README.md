# input-dom

Binds an [input-state](../input-state) to an `<input>` element: keyboard,
paste, drop and selection events in, rendered text and selection out. Layer 4
of the input stack, framework-free; React or Vue wrap `attachInput` in a few
lines.

```bash
npm install input-dom input-state text-buffer
```

```ts
import { createInputState, parseMask } from "input-state";
import { attachInput } from "input-dom";

const element = document.querySelector("input");
if (element !== null) {
  const controller = attachInput(
    element,
    createInputState({ mask: parseMask("99.99.9999") }),
    {
      onChange: (state) => {
        console.log(state.buffer.text);
      },
    }
  );
  // later: controller.destroy();
}
```

## How it works

Every `beforeinput` event is prevented and applied to the state instead, then
the state is rendered back. The element never edits itself, so a mask cannot
be broken by typing, pasting, dropping or autocorrect.

In overwrite mode the cursor is shown as a one-character selection (the slot
the next key fills). ArrowLeft, ArrowRight, Home and End move it; with Shift
or another modifier the browser handles the key.

## `attachInput(element, initial, options?)`

Returns `{ getState, setState, destroy }`.

| Option      | Does                                                                                                                                                                                      |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `normalize` | `(state) => state` after every change, e.g. keep a date's day valid                                                                                                                       |
| `onChange`  | Called with the new state after it changed                                                                                                                                                |
| `onKeyDown` | `(event, state) => state \| undefined`: handle keys first, e.g. ArrowUp to step a date segment; `undefined` leaves the key to the defaults                                                |
| `insert`    | `(state, text) => state` for typed, pasted and dropped text, default `paste`; e.g. datefield's `typeDate`, so "1.3.2026" becomes 01.03.2026 and a pasted date in any form fills the field |
| `digits`    | The ten characters to show for `0`–`9`, e.g. `localeDigits("ar-EG")` from datefield; the state keeps ASCII                                                                                |

`applyInputEvent(state, event)` and `visibleRange(state)` are exported for
other bindings.

## With datefield and fechita

```ts
import { attachInput } from "input-dom";
import {
  clampDay,
  dateMask,
  dateOrder,
  deriveFormat,
  localeDigits,
  parseSegments,
  typeDate,
  withSegments,
} from "datefield";
import { ar } from "fechita/locales/ar";
import { createInputState } from "input-state";
import { en } from "fechita/locales/en";
import { withLocales } from "fechita/core";

const locale = "ar-EG";
const format = deriveFormat(locale);
const { parseDate } = withLocales({ ar, en });
const element = document.createElement("input");

function parse(text: string): Date | undefined {
  const result = parseDate(text, { locale, order: dateOrder(format) });
  return result.valid ? result.date : undefined;
}

attachInput(element, createInputState({ mask: dateMask(format) }), {
  digits: localeDigits(locale), // shows ٣١/٠٣/٢٠٢٦
  // "1/3" → 01/03; a pasted "2026-03-31" or "31 مارس 2026" fills the field
  insert: (state, text) => typeDate(format, state, text, { parse }),
  normalize: (state) =>
    withSegments(
      state,
      clampDay(
        parseSegments(format, state.buffer.text),
        state.buffer.selection.head
      )
    ),
});
```

## License

Apache-2.0
