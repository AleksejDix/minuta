import { SelectTrigger, SelectValue } from "@/components/ui/select";
import type { JSX } from "react";

function LocaleTrigger({ id }: Readonly<{ id: string }>): JSX.Element {
  return (
    <SelectTrigger id={id} className="w-full">
      <SelectValue />
    </SelectTrigger>
  );
}

export { LocaleTrigger };
