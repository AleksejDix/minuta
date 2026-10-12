import type { JSX } from "react";

const TITLE = "minuta";
const SUBTITLE = "A segmented date field and a calendar that share one date.";

function PageHeader(): JSX.Element {
  return (
    <header className="grid gap-1">
      <h1 className="text-2xl font-semibold tracking-tight">{TITLE}</h1>
      <p className="text-sm text-muted-foreground">{SUBTITLE}</p>
    </header>
  );
}

export { PageHeader };
