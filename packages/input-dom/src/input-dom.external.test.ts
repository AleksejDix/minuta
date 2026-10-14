import type { AttachOptions, InputController } from "./input-dom";
import { createInputState, parseMask } from "input-state";
import { describe, expect, it, onTestFinished, vi } from "vitest";
import type { InputState } from "input-state";
import { attachInput } from "./input-dom";

const DATE = parseMask("99.99.9999");
const ONE = 1;

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

function beforeInput(element: HTMLInputElement, data: string): void {
  element.dispatchEvent(
    new InputEvent("beforeinput", {
      bubbles: true,
      cancelable: true,
      data,
      inputType: "insertText",
    })
  );
}

// Autofill, WebDriver and fireEvent set the value without a beforeinput
function setValue(
  element: HTMLInputElement,
  value: string,
  type: string
): void {
  element.value = value;
  element.dispatchEvent(new Event(type, { bubbles: true }));
}

describe("attachInput() changes without a beforeinput", () => {
  it.each(["input", "change", "blur"])(
    "reads the element's value on %s",
    { timeout: 5000 },
    (type) => {
      expect.hasAssertions();
      const onChange = vi.fn<(state: InputState) => void>();
      const { controller, element } = setup(createInputState({ mask: DATE }), {
        onChange,
      });
      setValue(element, "31/03/2026", type);
      expect(controller.getState().buffer.text).toBe("31.03.2026");
      expect(element.value).toBe("31.03.2026");
      expect(onChange).toHaveBeenCalledTimes(ONE);
    }
  );

  it("replaces a partly typed value", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { controller, element } = setup(createInputState({ mask: DATE }));
    beforeInput(element, "3");
    setValue(element, "28.10.2026", "input");
    expect(controller.getState().buffer.text).toBe("28.10.2026");
  });

  it("reads a field without a mask", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const { controller, element } = setup(createInputState({ value: "a" }));
    setValue(element, "hello", "input");
    expect(controller.getState().buffer.text).toBe("hello");
  });

  it("ignores events that change nothing", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const onChange = vi.fn<(state: InputState) => void>();
    const { element } = setup(createInputState({ mask: DATE }), { onChange });
    beforeInput(element, "3");
    element.dispatchEvent(new Event("blur"));
    expect(onChange).toHaveBeenCalledTimes(ONE);
  });
});
