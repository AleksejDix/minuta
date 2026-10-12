import type { JSX } from "react";
import { PageHeader } from "./PageHeader";
import { Playground } from "./Playground";

function App(): JSX.Element {
  return (
    <main className="mx-auto flex min-h-svh max-w-4xl flex-col gap-8 px-4 py-12">
      <PageHeader />
      <Playground />
    </main>
  );
}

export { App };
