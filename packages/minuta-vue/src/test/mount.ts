import type { Component, VNode } from "vue";
import { createApp, defineComponent, h } from "vue";
import type { MinutaOptions } from "#src/types";
import { MinutaRoot } from "#src/index";
import { onTestFinished } from "vitest";

const FIRST = 0;

type Mounted = Readonly<{
  element: HTMLElement;
}>;

type Recorder<Result> = Readonly<{
  component: Component;
  results: readonly Result[];
}>;

type Probed<Result> = Mounted &
  Readonly<{
    result: Result;
  }>;

/**
 * Mounts a render function into a fresh element, unmounted after the test.
 *
 * @param render - Renders the tree to mount
 * @returns The element holding the rendered tree
 */
function mountRender(render: () => VNode): Mounted {
  const element = document.createElement("div");
  document.body.append(element);
  const app = createApp(defineComponent({ setup: () => render }));
  app.mount(element);
  onTestFinished(() => {
    app.unmount();
    element.remove();
  });
  return { element };
}

/**
 * Returns the item at an index of a list, or throws when it is missing.
 *
 * @param items - The list
 * @param index - The index, negative to count from the end
 * @returns The item
 */
function itemAt<Item>(items: readonly Item[], index: number): Item {
  const item = items.at(index);
  if (item === undefined) {
    throw new Error(`Expected an item at ${String(index)}`);
  }
  return item;
}

/**
 * A component whose setup runs a composable and records its result.
 *
 * @param composable - The composable to run
 * @returns The component and the result of every mounted instance
 */
function recorder<Result>(composable: () => Result): Recorder<Result> {
  const results: Result[] = [];
  const component = defineComponent({
    setup: () => {
      results.push(composable());
      return (): undefined => undefined;
    },
  });
  return { component, results };
}

/**
 * Runs a composable in the setup of a component inside `<MinutaRoot>`.
 *
 * @param composable - The composable to run
 * @param options - The props of `<MinutaRoot>`
 * @returns The composable's result and the mounted element
 */
function probeInRoot<Result>(
  composable: () => Result,
  options: MinutaOptions = {}
): Probed<Result> {
  const probe = recorder(composable);
  const { element } = mountRender(() =>
    h(MinutaRoot, options, { default: () => h(probe.component) })
  );
  return { element, result: itemAt(probe.results, FIRST) };
}

export { itemAt, mountRender, probeInRoot, recorder };
