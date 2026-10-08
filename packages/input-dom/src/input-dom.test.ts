import type { AttachOptions, InputController } from "./input-dom";
import { createInputState, parseMask, setSelection } from "input-state";
import { describe, expect, it, onTestFinished, vi } from "vitest";
import type { InputState } from "input-state";
import { attachInput } from "./input-dom";

const DATE = parseMask("99.99.9999");
const START = 0;
const ONE = 1;
const TWO = 2;
const EIGHT = 8;

function setup(
  initial: InputState,
  options: AttachOptions = {}
): { controller: InputController; element: HTMLInputElement } {
  const element = document.createElement("input");
  document.body.append(element);
  const controller = attachInput(element, initial, options);
  onTestFinished(() => {
    controller.destroy();
    element.remove();
  });
  return { controller, element };
}

function beforeInput(
  element: HTMLInputElement,
  inputType: string,
  data = ""
): InputEvent {
  const event = new InputEvent("beforeinput", {
    bubbles: true,
    cancelable: true,
    data,
    inputType,
  });
  element.dispatchEvent(event);
  return event;
}

describe("attachInput() rendering", () => {
  it("renders the initial state into the element", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { element } = setup(createInputState({ mask: DATE }));
    expect(element.value).toBe("__.__.____");
    expect([element.selectionStart, element.selectionEnd]).toStrictEqual([
      START,
      ONE,
    ]);
  });

  it("renders a state passed to setState", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { controller, element } = setup(createInputState({ value: "a" }));
    controller.setState(createInputState({ value: "hello" }));
    expect(element.value).toBe("hello");
    expect(controller.getState().buffer.text).toBe("hello");
  });
});

describe("attachInput() beforeinput", () => {
  it(
    "types through the mask and prevents the browser default",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const onChange = vi.fn<(state: InputState) => void>();
      const { element } = setup(createInputState({ mask: DATE }), { onChange });
      const event = beforeInput(element, "insertText", "3");
      expect(event.defaultPrevented).toBe(true);
      expect(element.value).toBe("3_.__.____");
      expect(onChange).toHaveBeenCalledTimes(ONE);
    }
  );

  it("maps backspace, delete and paste", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { element } = setup(createInputState({ mask: DATE }));
    beforeInput(element, "insertFromPaste", "31/03/2026");
    expect(element.value).toBe("31.03.2026");
    beforeInput(element, "deleteContentBackward");
    expect(element.value).toBe("31.03.202_");
  });

  it(
    "does not call onChange when the input is rejected",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const onChange = vi.fn<(state: InputState) => void>();
      const { element } = setup(createInputState({ mask: DATE }), { onChange });
      beforeInput(element, "insertText", "x");
      expect(onChange).not.toHaveBeenCalled();
    }
  );
});

describe("attachInput() selection and modes", () => {
  it("picks up selection changes from the element", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { controller, element } = setup(
      createInputState({ mask: DATE, value: "31.03.2026" })
    );
    element.setSelectionRange(EIGHT, EIGHT);
    element.dispatchEvent(new Event("select"));
    beforeInput(element, "insertText", "1");
    expect(element.value).toBe("31.03.2016");
    expect(controller.getState().buffer.selection.head).toBe(EIGHT + ONE);
  });

  it("ignores the echo of its own block cursor", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { controller, element } = setup(
      setSelection(createInputState({ mode: "overwrite", value: "abc" }), TWO)
    );
    expect([element.selectionStart, element.selectionEnd]).toStrictEqual([
      TWO,
      TWO + ONE,
    ]);
    element.dispatchEvent(new Event("select"));
    expect(controller.getState().buffer.selection).toStrictEqual({
      anchor: 2,
      head: 2,
    });
  });

  it("toggles insert/overwrite on the Insert key", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { controller, element } = setup(createInputState({ value: "ab" }));
    element.dispatchEvent(
      new KeyboardEvent("keydown", { cancelable: true, key: "Insert" })
    );
    expect(controller.getState().mode).toBe("overwrite");
  });
});

describe("attachInput() extension points", () => {
  it("lets onKeyDown replace the state", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const replaced = createInputState({ value: "up" });
    const { element } = setup(createInputState({ value: "x" }), {
      onKeyDown: () => replaced,
    });
    const event = new KeyboardEvent("keydown", {
      cancelable: true,
      key: "ArrowUp",
    });
    element.dispatchEvent(event);
    expect(element.value).toBe("up");
    expect(event.defaultPrevented).toBe(true);
  });

  it("runs normalize after every change", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { element } = setup(createInputState({ value: "" }), {
      normalize: (state) =>
        createInputState({ value: state.buffer.text.toUpperCase() }),
    });
    beforeInput(element, "insertText", "a");
    expect(element.value).toBe("A");
  });

  it("stops listening after destroy", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { controller, element } = setup(createInputState({ mask: DATE }));
    controller.destroy();
    const event = beforeInput(element, "insertText", "3");
    expect(event.defaultPrevented).toBe(false);
    expect(element.value).toBe("__.__.____");
  });
});
