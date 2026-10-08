import { useCallback, useState } from "react";
import { CalendarExample } from "minuta-react/components";
import type { JSX } from "react";
import { SegmentedDateInput } from "./SegmentedDateInput";

function App(): JSX.Element {
  const [selected, setSelected] = useState<Date>();

  // A fresh new Date() so re-picking the same day still resets the input
  const handleSelectDate = useCallback((date: Readonly<Date>) => {
    setSelected(new Date(date));
  }, []);

  return (
    <main className="app-shell">
      <SegmentedDateInput date={selected} />
      <CalendarExample onSelectDate={handleSelectDate} />
    </main>
  );
}

export { App };
