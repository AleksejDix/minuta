# gap-buffer

A fixed-capacity, immutable buffer of slots plus a cursor — the engine behind
segmented inputs such as OTP codes and date fields. Typing overwrites the slot
at the cursor, so correcting one character never shifts the others. Zero
dependencies, no DOM.

```bash
npm install gap-buffer
```

```typescript
import { GapBuffer, REGEXP_ONLY_DIGITS } from "gap-buffer";

let otp = new GapBuffer({ maxLength: 6, pattern: REGEXP_ONLY_DIGITS });

otp = otp.insertAt(otp.cursor, "4"); // "4", cursor → 1
otp = otp.pasteAt(otp.cursor, "2-9"); // skips "-": "429", cursor → 3
otp = otp.backspaceAt(otp.cursor); // empty slot → clears previous: "42"
otp = otp.focus(0).insertAt(0, "7"); // overwrite in place: "72"

otp.toString(); // gaps render as " ", trailing gaps stripped
otp.isComplete; // true once every slot is filled
```

Every operation returns a new buffer, or the same instance when nothing
changed, so it works as a value in React state.

## License

Apache-2.0
